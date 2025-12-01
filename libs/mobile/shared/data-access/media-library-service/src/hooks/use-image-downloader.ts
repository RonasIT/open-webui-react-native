import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { useState } from 'react';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { mediaLibraryService } from '../service';

export const useImageDownloader = (): typeof result => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const downloadImage = async (url: string, authorizationToken?: string): Promise<void> => {
    try {
      setIsDownloading(true);
      const image = await mediaLibraryService.saveImage(url, authorizationToken);

      if (image) {
        ToastService.showSuccess(i18n.t('SHARED.MEDIA_LIBRARY_SERVICE.TEXT_SUCCESSFULLY_SAVED'));
      }
    } catch {
      ToastService.showError(i18n.t('SHARED.MEDIA_LIBRARY_SERVICE.TEXT_ERROR_DURING_SAVING'));
    } finally {
      setIsDownloading(false);
    }
  };

  const result = {
    downloadImage,
    isDownloading,
  };

  return result;
};
