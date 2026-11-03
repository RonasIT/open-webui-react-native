import { onlineManager } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { chatSyncService } from '@open-webui-react-native/shared/data-access/chat-sync';
import { useAppStateChange } from '@open-webui-react-native/shared/utils/use-app-state-change';

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
  // On Android an external activity (photo/document picker, camera, share sheet) moves the app to background,
  // so the sync pauses there and resumes on return.
  useAppStateChange({
    onChange: () => {
      const wasInBackground = wasInBackgroundRef.current;
      wasInBackgroundRef.current = false;

      if (isEnabled && wasInBackground) {
        void chatSyncService.syncIfDue();
      }
    },
  });

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    void chatSyncService.sync();

    return onlineManager.subscribe((isOnline) => {
      if (isOnline) {
        void chatSyncService.syncIfDue();
      }
    });
  }, [isEnabled]);
};
