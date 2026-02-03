import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { permissionAlertService } from '@open-webui-react-native/shared/utils/permission-alert';

export class MediaLibraryService {
  public async saveImage(source: string, authorizationToken?: string): Promise<string | void> {
    const { status } = await MediaLibrary.requestPermissionsAsync(false, ['photo']);

    if (status === MediaLibrary.PermissionStatus.DENIED) {
      permissionAlertService.showAlert(
        i18n.t('SHARED.MEDIA_LIBRARY_SERVICE.TEXT_SETTINGS'),
        i18n.t('SHARED.MEDIA_LIBRARY_SERVICE.TEXT_SETTINGS_MESSAGE'),
      );

      return;
    }

    const ext = this.getExtensionFromSource(source);
    const filename = `image_${Date.now()}.${ext}`;
    const targetPath = `${FileSystem.cacheDirectory}${filename}`;

    // TODO: Update logic for download AI-generated images, root task: xhttps://app.clickup.com/t/24336023/PRD-1740
    if (source.startsWith('http')) {
      await FileSystem.downloadAsync(
        source,
        targetPath,
        authorizationToken ? { headers: { Authorization: `Bearer ${authorizationToken}` } } : undefined,
      );
    } else {
      const base64 = source.startsWith('data:image') ? source.split(',')[1] : source;
      await FileSystem.writeAsStringAsync(targetPath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    await MediaLibrary.saveToLibraryAsync(targetPath);

    return targetPath;
  }

  private getExtensionFromSource(source: string): string {
    if (source.startsWith('data:image')) {
      const match = source.match(/data:image\/(\w+);base64/);

      return match?.[1] ?? 'jpg';
    }

    return 'jpg';
  }
}

export const mediaLibraryService = new MediaLibraryService();
