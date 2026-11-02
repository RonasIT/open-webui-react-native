import { onlineManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import { chatSyncService } from '@open-webui-react-native/shared/data-access/chat-sync';
import { useAppStateChange } from '@open-webui-react-native/shared/utils/use-app-state-change';

const syncChats = (): void => {
  void chatSyncService.sync();
};

// NOTE: Disabled until the init requests finish, so the full chat list does not delay them.
export const useChatSync = ({ isEnabled }: { isEnabled: boolean }): void => {
  useAppStateChange({ onChange: () => isEnabled && syncChats() });

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    syncChats();

    return onlineManager.subscribe((isOnline) => {
      if (isOnline) {
        syncChats();
      }
    });
  }, [isEnabled]);
};
