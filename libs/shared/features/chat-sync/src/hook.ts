import { onlineManager } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { chatSyncService } from '@open-webui-react-native/shared/data-access/chat-sync';
import { useAppStateChange } from '@open-webui-react-native/shared/utils/use-app-state-change';

const foregroundSyncIntervalMs = 60 * 1000;

const syncChats = (): void => {
  void chatSyncService.sync();
};

// NOTE: Disabled until the init requests finish, so the full chat list does not delay them.
export const useChatSync = ({ isEnabled }: { isEnabled: boolean }): void => {
  const wasInBackgroundRef = useRef(false);

  useAppStateChange({
    status: 'background',
    onChange: () => {
      wasInBackgroundRef.current = true;
    },
  });

  // NOTE: Only a return from background: iOS goes inactive for the photo picker, notification shade, system dialogs.
  // NOTE: Throttled after a completed run only; a run stopped in background resumes right away.
  useAppStateChange({
    onChange: () => {
      const wasInBackground = wasInBackgroundRef.current;
      wasInBackgroundRef.current = false;

      if (isEnabled && wasInBackground && Date.now() - chatSyncService.lastCompletedRunAt >= foregroundSyncIntervalMs) {
        syncChats();
      }
    },
  });

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
