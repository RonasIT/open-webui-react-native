import { useSelector } from '@legendapp/state/react';
import { Chat } from '@open-webui-react-native/mobile/chat/features/chat';
import {
  ChatActionsMenuSheet,
  ChatActionsMenuSheetMethods,
} from '@open-webui-react-native/mobile/shared/features/chat-actions-menu-sheet';
import { useSetSelectedModel } from '@open-webui-react-native/mobile/shared/features/use-set-selected-model';
import { NoConnectionBanner } from '@open-webui-react-native/mobile/shared/ui/no-connection-banner';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import {
  AppScreen,
  AppHeader,
  AppPressable,
  AppText,
  Icon,
  FullScreenSearchModal,
  AppKeyboardControllerView,
  IconButton,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import {
  ChatScreenParams,
  navigationConfig,
  useInitialNavigation,
} from '@open-webui-react-native/mobile/shared/utils/navigation';
import { chatApi, modelsApi } from '@open-webui-react-native/shared/data-access/api';
import { appState$ } from '@open-webui-react-native/shared/data-access/app-state';
import { useNavigateOnce } from '@open-webui-react-native/shared/utils/navigation';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { useNavigationContainerRef, usePathname, useLocalSearchParams, router } from 'expo-router';
import { ReactElement, useCallback, useRef } from 'react';

export default function ChatScreen(): ReactElement {
  const translate = useTranslation('CHAT.CHAT_SCREEN');
  const path = usePathname();
  const rootNavigation = useNavigationContainerRef();
  const { id, isNewChat }: ChatScreenParams = useLocalSearchParams();
  const { resetToChatsListScreen } = useInitialNavigation();
  const navigateOnce = useNavigateOnce();
  const chatActionsSheetRef = useRef<ChatActionsMenuSheetMethods>(null);
  const navigateToClonedChat = (id: string): void => navigateOnce(navigationConfig.main.chat.view({ id }));

  const isOfflineMode = useSelector(appState$.isOfflineMode);

  const { data: models, isLoading: isModelsLoading } = modelsApi.useGetModels();
  const { data: chat, isLoading: isChatLoading } = chatApi.useGet(id);
  const { modelId, modelName, onSelectModel } = useSetSelectedModel(id);

  const handleGoBackPress = (): void => router.back();

  const isLoading = isChatLoading || isModelsLoading;

  const handleResetToChatsList = useCallback((): void => {
    if (path.includes(id)) {
      resetToChatsListScreen();
    }
  }, [rootNavigation, path, id]);

  const renderTrigger = ({ onPress }: { onPress: () => void }): ReactElement => (
    <AppPressable className='flex-row items-center' onPress={onPress}>
      <AppText numberOfLines={1} className='text-md-sm sm:text-md font-medium max-w-[80%]'>
        {modelName}
      </AppText>
      <Icon name='chevronDown' />
    </AppPressable>
  );

  return (
    <AppKeyboardControllerView className='bg-background-primary'>
      <AppScreen
        className={cn(isOfflineMode && 'pt-20')}
        noOutsideSpacing
        header={
          <AppHeader
            title={
              modelId || isLoading ? (
                <FullScreenSearchModal
                  data={models || []}
                  renderTrigger={renderTrigger}
                  selectedItemId={modelId}
                  onSelectItem={onSelectModel}
                  searchPlaceholder={translate('TEXT_SELECT_A_MODEL')}
                />
              ) : (
                translate('TEXT_LOADING')
              )
            }
            onGoBack={handleGoBackPress}
            accessoryRight={
              <IconButton
                className='p-0'
                iconName='moreDots'
                onPress={() => {
                  if (!chat) return;
                  chatActionsSheetRef.current?.present(chat);
                }}
              />
            }
          />
        }
        scrollDisabled>
        <NoConnectionBanner isVisible={isOfflineMode} />
        <Chat
          chatId={id}
          isNewChat={!!isNewChat}
          selectedModelId={modelId}
          resetToChatsList={handleResetToChatsList} />
        <ChatActionsMenuSheet ref={chatActionsSheetRef} goToChat={navigateToClonedChat} />
      </AppScreen>
    </AppKeyboardControllerView>
  );
}
