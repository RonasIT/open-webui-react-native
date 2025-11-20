import { useSelector } from '@legendapp/state/react';
import { CreateChat } from '@open-web-ui-mobile-client-react-native/mobile/chat/features/create-chat';
import {
  UpsertFolderSheet,
  UpsertFolderSheetMethods,
} from '@open-web-ui-mobile-client-react-native/mobile/folder/features/upsert-folder-sheet';
import { useSetSelectedModel } from '@open-web-ui-mobile-client-react-native/mobile/shared/features/use-set-selected-model';
import { NoConnectionBanner } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/no-connection-banner';
import { ScreenWrapper } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/screen-wrapper';
import { AppHeader, AppSpinner } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { uiState$ } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-state';
import { navigationConfig } from '@open-web-ui-mobile-client-react-native/mobile/shared/utils/navigation';
import { appState$ } from '@open-web-ui-mobile-client-react-native/shared/data-access/app-state';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { router } from 'expo-router';
import { ReactElement, useRef } from 'react';

export default function CreateChatScreen(): ReactElement {
  const translate = useTranslation('CHAT.CREATE_CHAT');
  const upsertFolderSheetRef = useRef<UpsertFolderSheetMethods>(null);

  const handleChatCreated = (id: string): void =>
    router.replace(navigationConfig.main.chat.view({ id, isNewChat: 'true' }));

  const openCreateFolderModal = (): void => upsertFolderSheetRef.current?.present();

  const handleBackPress = (): void => router.back();

  const isBottomSheetInputFocused = useSelector(uiState$.isBottomSheetInputFocused);
  const isOfflineMode = useSelector(appState$.isOfflineMode);
  const { isLoading } = useSetSelectedModel();

  if (isLoading) {
    return <AppSpinner isFullScreen />;
  }

  return (
    <ScreenWrapper
      isKeyboardAvoiding
      screenProps={{
        className: 'pt-0',
        header: <AppHeader title={translate('TEXT_NEW_CHAT')} onGoBack={handleBackPress} />,
      }}
      safeAreaProps={{ edges: ['bottom'] }}
      keyBoardAvoidingProps={{ enabled: !isBottomSheetInputFocused }}>
      <NoConnectionBanner isVisible={isOfflineMode} />
      <CreateChat
        onChatCreated={handleChatCreated}
        onCreateFolderPress={openCreateFolderModal}
        createFolderModalComponent={<UpsertFolderSheet ref={upsertFolderSheetRef} />}
      />
    </ScreenWrapper>
  );
}
