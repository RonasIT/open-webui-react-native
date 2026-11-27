import { useSelector } from '@legendapp/state/react';
import { useEffect } from 'react';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { socketService } from './service';
import { webSocketState$ } from './state';

interface UseSocketArgs {
  isAuthenticated: boolean;
  isOfflineMode: boolean;
}

export const useSocket = ({ isAuthenticated, isOfflineMode }: UseSocketArgs): void => {
  // NOTE: The socket takes its headers at connect time, so a new Access pass needs a new connection.
  const accessPassValue = useSelector(authState$.accessPass.value);

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

  useEffect(() => {
    socketService.reconnectWithNewHeaders();
  }, [accessPassValue]);
};
