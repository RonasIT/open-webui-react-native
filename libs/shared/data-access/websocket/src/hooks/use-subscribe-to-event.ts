import { useSelector } from '@legendapp/state/react';
import { useEffect } from 'react';
import { appState$ } from '@open-webui-react-native/shared/data-access/app-state';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { WebSocketEventName } from '../enums';
import { socketService } from '../service';

export interface UseSubscribeToEventArgs {
  event: WebSocketEventName;
  queryKey: ReadonlyArray<unknown>;
  handleEvent: (...args: any) => void;
  isSuccess: boolean;
}

export const useSubscribeToEvent = ({ event, handleEvent, isSuccess, queryKey }: UseSubscribeToEventArgs): void => {
  const queryKeyStringify = JSON.stringify(queryKey);
  const eventListener = { queryKey: queryKeyStringify, callback: handleEvent };
  const isOfflineMode = useSelector(appState$.isOfflineMode);

  useEffect(() => {
    if (isSuccess && !isOfflineMode) {
      socketService.subscribeToEvent(event, eventListener);

      queryClient.getQueryCache().subscribe((e) => {
        if (e.type === 'removed' && JSON.stringify(e.query.queryKey) === queryKeyStringify) {
          socketService.unsubscribeFromEvent(event, eventListener);
        }
      });
    }
  }, [isSuccess, queryKeyStringify, isOfflineMode]);
};
