import { useNetInfo } from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import { appState$ } from '@open-webui-react-native/shared/data-access/app-state';

interface UseNetworkConnectionResult {
  isOfflineMode: boolean;
}

export const useNetworkConnection = (): UseNetworkConnectionResult => {
  const { isConnected, isInternetReachable } = useNetInfo();
  const isOfflineMode = isInternetReachable === false || isConnected === false;

  useEffect(() => {
    appState$.setIsOfflineMode(isOfflineMode);
    onlineManager.setOnline(!isOfflineMode);
  }, [isOfflineMode]);

  return {
    isOfflineMode,
  };
};
