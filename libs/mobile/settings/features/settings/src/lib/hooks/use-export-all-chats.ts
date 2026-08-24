import { useState } from 'react';
import {
  fileSystemService,
  MimeType,
  UtiType,
} from '@open-webui-react-native/mobile/shared/data-access/file-system-service';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { settingsApiConfig } from '../config';

interface UseExportAllChatsResult {
  isExporting: boolean;
  exportAllChats: () => Promise<void>;
}

export const useExportAllChats = (): UseExportAllChatsResult => {
  const [isExporting, setIsExporting] = useState(false);
  const { exportAllChatsApiURL, downloadFileName } = settingsApiConfig;

  const exportAllChats = async (): Promise<void> => {
    setIsExporting(true);

    try {
      await fileSystemService.downloadAndShareFile(exportAllChatsApiURL, downloadFileName, MimeType.JSON, UtiType.JSON);
    } catch {
      ToastService.showError();
    } finally {
      setIsExporting(false);
    }
  };

  return { isExporting, exportAllChats };
};
