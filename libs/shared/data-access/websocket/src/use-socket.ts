import { useEffect } from 'react';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { socketService } from './service';
import { webSocketState$ } from './state';

interface UseSocketArgs {
  isAuthenticated: boolean;
  isOfflineMode: boolean;
}

export const useSocket = ({ isAuthenticated, isOfflineMode }: UseSocketArgs): void => {
  const onSocketConnectionHandler = (isConnected: boolean) => () => {
    webSocketState$.isSocketConnected.set(isConnected);
  };

  useEffect(() => {
    if (isAuthenticated && !isOfflineMode) {
      const token = appStorageService.token.get();

      if (token) {
        socketService.init(token, onSocketConnectionHandler(true), onSocketConnectionHandler(false));

        return () => {
          socketService.disconnect();
        };
      }
    }
  }, [isAuthenticated, isOfflineMode]);
};
