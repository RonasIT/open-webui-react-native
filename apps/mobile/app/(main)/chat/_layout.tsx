import {
  VoiceModeModal,
  VoiceModeModalMethods,
  VoiceModeModalContext,
  VoiceModeModalContextMethods,
} from '@open-web-ui-mobile-client-react-native/mobile/chat/features/voice-mode-modal';
import { navigationConfig } from '@open-web-ui-mobile-client-react-native/mobile/shared/utils/navigation';
import { router } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { ReactElement, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const unstable_settings = {
  initialRouteName: 'create',
};

export default function ChatLayout(): ReactElement {
  const voiceModeModalRef = useRef<VoiceModeModalMethods>(null);

  const contextValue: VoiceModeModalContextMethods = {
    present: async ({ chatId, modelId }) => await voiceModeModalRef.current?.present({ chatId, modelId }),
    close: async () => await voiceModeModalRef.current?.close(),
  };

  const handleChatCreated = (id: string): void => router.replace(navigationConfig.main.chat.view({ id }));

  return (
    <VoiceModeModalContext.Provider value={contextValue}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='create' />
        <Stack.Screen name='list' />
        <Stack.Screen name='[id]' />
        <Stack.Screen name='archived-chats' />
        <Stack.Screen name='search' options={{ animation: 'fade_from_bottom', animationDuration: 100 }} />
        <Stack.Screen
          name='search-archived-chats'
          options={{ animation: 'fade_from_bottom', animationDuration: 100 }}
        />
      </Stack>
      <VoiceModeModal ref={voiceModeModalRef} onChatCreated={handleChatCreated} />
    </VoiceModeModalContext.Provider>
  );
}
