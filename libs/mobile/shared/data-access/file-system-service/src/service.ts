import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Directory, File, Paths } from 'expo-file-system/next';
import * as Sharing from 'expo-sharing';
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

  public async shareAsync(fileUri: string, fileName: string, mimeType: MimeType, utiType: UtiType): Promise<void> {
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
