import { useSelector } from '@legendapp/state/react';
import { Chat } from '@open-web-ui-mobile-client-react-native/mobile/chat/features/chat';
import { useSetSelectedModel } from '@open-web-ui-mobile-client-react-native/mobile/shared/features/use-set-selected-model';
import { NoConnectionBanner } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/no-connection-banner';
import { cn } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';
import {
  AppScreen,
  AppHeader,
  AppPressable,
  AppText,
  Icon,
  FullScreenSearchModal,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import {
  ChatScreenParams,
  useInitialNavigation,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/utils/navigation';
import { modelsApi } from '@open-web-ui-mobile-client-react-native/shared/data-access/api';
import { appState$ } from '@open-web-ui-mobile-client-react-native/shared/data-access/app-state';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { useNavigationContainerRef, usePathname, useLocalSearchParams, router } from 'expo-router';
import { ReactElement, useCallback } from 'react';

export default function ChatScreen(): ReactElement {
  const translate = useTranslation('CHAT.CHAT_SCREEN');
  const path = usePathname();
  const rootNavigation = useNavigationContainerRef();
  const { id, isNewChat }: ChatScreenParams = useLocalSearchParams();
  const { resetToChatsListScreen } = useInitialNavigation();

  const isOfflineMode = useSelector(appState$.isOfflineMode);

  const { data: models, isLoading } = modelsApi.useGetModels();
  const { modelId, modelName, onSelectModel } = useSetSelectedModel(id);

  const handleGoBackPress = (): void => router.back();

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
        />
      }
      scrollDisabled>
      <NoConnectionBanner isVisible={isOfflineMode} />
      <Chat
        chatId={id}
        isNewChat={!!isNewChat}
        selectedModelId={modelId}
        resetToChatsList={handleResetToChatsList} />
    </AppScreen>
  );
}
