import { useNetInfo } from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import { appState$ } from '@open-webui-react-native/shared/data-access/app-state';

interface UseNetworkConnectionResult {
  isOfflineMode: boolean;
}

export const useNetworkConnection = (): UseNetworkConnectionResult => {
  // NOTE: `isInternetReachable` is ignored on purpose: it fails when Google or the OS connectivity check is blocked
  // (some regions, VPN-only or local networks) even though the user's own server is reachable.
  const { isConnected } = useNetInfo();
  const isOfflineMode = isConnected === false;

  useEffect(() => {
    appState$.setIsOfflineMode(isOfflineMode);
    onlineManager.setOnline(!isOfflineMode);
  }, [isOfflineMode]);

  return {
    isOfflineMode,
  };
};
