import * as FileSystem from 'expo-file-system';
import { useState } from 'react';
import {
  fileSystemService,
  MimeType,
  UtiType,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/data-access/file-system-service';
import { ToastService } from '@open-web-ui-mobile-client-react-native/shared/utils/toast-service';
import { archivedChatsApiConfig } from '../config';

interface UseExportArchivedChatsResult {
  isExporting: boolean;
  exportArchivedChats: () => Promise<void>;
}

export const useExportArchivedChats = (): UseExportArchivedChatsResult => {
  const [isExporting, setIsExporting] = useState(false);
  const { exportAllChatsApiURL, downloadFileName } = archivedChatsApiConfig;

  const exportArchivedChats = async (): Promise<void> => {
    setIsExporting(true);

    try {
      const fileUri = `${FileSystem.documentDirectory}${downloadFileName}`;
      const downloadedFile = await fileSystemService.downloadFile(exportAllChatsApiURL, fileUri);

      await fileSystemService.shareAsync(downloadedFile.uri, downloadFileName, MimeType.JSON, UtiType.JSON);
    } catch {
      ToastService.showError();
    } finally {
      setIsExporting(false);
    }
  };

  return { isExporting, exportArchivedChats };
};
