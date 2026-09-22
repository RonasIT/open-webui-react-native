import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { isDataUri } from '@open-webui-react-native/shared/utils/files';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { FileExtension, MimeType, UtiType } from './enums';

export class FileSystemService {
  private _cacheDirectory = new Directory(Paths.cache);

  public async convertToBase64(uri: string): Promise<string> {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return base64;
  }

  public async shareTextFile(fileName: string, content: string): Promise<void> {
    const fileUri = this.createTemporaryFile(fileName, content, FileExtension.TXT);

    try {
      await this.shareAsync(fileUri, fileName, MimeType.TXT, UtiType.TXT);
    } finally {
      this.deleteFile(fileUri);
    }
  }

  public async pickFile(options?: DocumentPicker.DocumentPickerOptions): Promise<DocumentPicker.DocumentPickerResult> {
    return await DocumentPicker.getDocumentAsync({
      type: '*/*',
      ...options,
    });
  }

  public async downloadFile(
    uri: string,
    fileURI: string,
    options?: FileSystem.DownloadOptions,
  ): Promise<FileSystem.FileSystemDownloadResult> {
    return await FileSystem.downloadAsync(uri, fileURI, options);
  }

  // NOTE: `mimeType` / `utiType` are plain strings rather than the enums because files produced by
  // a tool carry whatever type their source system reported, which the app cannot enumerate.
  public async shareAsync(fileUri: string, fileName: string, mimeType?: string, utiType?: string): Promise<void> {
    const isAvailable = await Sharing.isAvailableAsync();

    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        dialogTitle: i18n.t('SHARED.FILE_SYSTEM_SERVICE.TEXT_SHARE', { fileName }),
        mimeType,
        UTI: utiType,
      });
    } else {
      ToastService.showError(i18n.t('SHARED.FILE_SYSTEM_SERVICE.TEXT_SHARING_IS_NOT_AVAILABLE'));
    }
  }

  public async shareJsonFile(fileName: string, content: string): Promise<void> {
    const fileUri = this.createTemporaryFile(fileName, content, FileExtension.JSON);

    try {
      await this.shareAsync(fileUri, fileName, MimeType.JSON, UtiType.JSON);
    } finally {
      this.deleteFile(fileUri);
    }
  }

  public async downloadAndShareFile(
    uri: string,
    fileName: string,
    mimeType: MimeType,
    utiType: UtiType,
  ): Promise<void> {
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    const downloadedFile = await this.downloadFile(uri, fileUri);

    await this.shareAsync(downloadedFile.uri, fileName, mimeType, utiType);
  }

  // NOTE: For a file the app did not create — a tool result fetched from the server, or one the
  // tool inlined as a base64 data URI. Cached only for as long as the share sheet needs it.
  public async shareExternalFile(
    source: string,
    fileName: string,
    options?: { mimeType?: string; authorizationToken?: string },
  ): Promise<void> {
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

    if (isDataUri(source)) {
      await FileSystem.writeAsStringAsync(fileUri, source.slice(source.indexOf(',') + 1), {
        encoding: FileSystem.EncodingType.Base64,
      });
    } else {
      const { authorizationToken } = options ?? {};

      await this.downloadFile(
        source,
        fileUri,
        authorizationToken ? { headers: { Authorization: `Bearer ${authorizationToken}` } } : undefined,
      );
    }

    try {
      await this.shareAsync(fileUri, fileName, options?.mimeType);
    } finally {
      this.deleteFile(fileUri);
    }
  }

  private createTemporaryFile(fileName: string, content: string, extension: FileExtension): string {
    const file = new File(this._cacheDirectory, `${fileName}.${extension}`);
    file.write(content);

    return file.uri;
  }

  private deleteFile(fileUri: string): void {
    const file = new File(fileUri);

    if (file.exists) {
      file.delete();
    }
  }
}

export const fileSystemService = new FileSystemService();
