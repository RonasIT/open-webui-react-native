import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import dayjs from 'dayjs';
import { delay } from 'lodash-es';
import React, { ReactElement, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { InteractionManager } from 'react-native';
import { EditMessageInput } from '@open-web-ui-mobile-client-react-native/mobile/chat/features/edit-message-input';
import {
  FormChatInput,
  FormChatInputSchema,
} from '@open-web-ui-mobile-client-react-native/mobile/chat/features/form-chat-input';
import { useEditMessage } from '@open-web-ui-mobile-client-react-native/mobile/chat/features/use-edit-message';
import { useSendMessage } from '@open-web-ui-mobile-client-react-native/mobile/chat/features/use-send-message';
import { useAttachedFiles } from '@open-web-ui-mobile-client-react-native/mobile/shared/features/use-attached-files';
import { cn } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';
import {
  AppKeyboardControllerView,
  AppSpinner,
  View,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { FormValues } from '@open-web-ui-mobile-client-react-native/mobile/shared/utils/form';
import {
  chatApi,
  ChatGenerationOption,
  chatQueriesKeys,
} from '@open-web-ui-mobile-client-react-native/shared/data-access/api';
import { Role } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';
import { useSubscribeToQueryCache } from '@open-web-ui-mobile-client-react-native/shared/data-access/query-client';
import { webSocketConfig, webSocketState$ } from '@open-web-ui-mobile-client-react-native/shared/data-access/websocket';
import { ToastService } from '@open-web-ui-mobile-client-react-native/shared/utils/toast-service';
import { useAppStateChange } from '@open-web-ui-mobile-client-react-native/shared/utils/use-app-state-change';
import { patchNewChat } from './utils';

const LazyChatMessagesList = React.lazy(() => import('./components/messages-list/component'));

interface ChatProps {
  chatId: string;
  resetToChatsList: () => void;
  selectedModelId?: string;
  isNewChat?: boolean;
}

export function Chat({ chatId, selectedModelId, isNewChat, resetToChatsList }: ChatProps): ReactElement {
  const translate = useTranslation('CHAT.CHAT');

  const [isInputFocusing, setIsInputFocusing] = useState(false); //NOTE: Needs to avoid ChatBottomButton jumping when auto-scrolling after focus

  const isSocketConnected = useSelector(webSocketState$.isSocketConnected);

  const [isMessagesListLoaded, setIsMessagesListLoaded] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);

  const {
    attachedFiles,
    attachedImages,
    handleImageUploaded,
    handleDeleteImage,
    handleFileUploaded,
    handleDeleteFile,
    resetAttachments,
  } = useAttachedFiles();

  const { data: chat, refetch, isLoading, isRefetching, isSuccess } = chatApi.useGet(chatId);
  const { sendMessage, isLoading: isSending } = useSendMessage({ chatData: chat });
  const {
    editingMessageId,
    startEditing,
    cancelEditing,
    control: editMessageControl,
    saveMessage,
    sendEditedMessage,
  } = useEditMessage({ chat, modelId: selectedModelId });

  const history = chat?.chat.history;
  const isResponseGenerating = !history?.messages[history.currentId].done;

  const shouldHideContent = isLoading || isRefetching || !isMessagesListLoaded || !selectedModelId;

  useSubscribeToQueryCache({
    eventType: 'removed',
    queryKey: chatQueriesKeys.get(chatId).queryKey,
    onQueryChange: resetToChatsList,
  });

  useAppStateChange({
    onChange: (lastStatusChangeTimeStamp) => {
      if (
        lastStatusChangeTimeStamp &&
        dayjs().diff(lastStatusChangeTimeStamp, 'seconds') > webSocketConfig.pingTimeout
      ) {
        refetch();
      }
    },
  });

  const { control, handleSubmit, reset } = useForm<FormValues<FormChatInputSchema>>({
    defaultValues: {
      inputValue: '',
    },
  });

  const handleChatMessagesListLayout = (): void => {
    setIsMessagesListLoaded(true);
  };

  const handleInputFocus = (): void => {
    setIsInputFocusing(true);
    delay(() => {
      setIsInputFocusing(false);
    }, 1000);
  };

  const onSubmit = (options: Array<ChatGenerationOption>): Promise<void> =>
    handleSubmit(({ inputValue }: FormValues<FormChatInputSchema>): void => {
      if (!selectedModelId) {
        return ToastService.showError(translate('TEXT_MODEL_NOT_SELECTED'));
      }

      sendMessage(inputValue, selectedModelId, options, attachedFiles.get(), attachedImages.get());
      reset();
      resetAttachments();
    })();

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      delay(() => {
        setIsChatVisible(true);
      }, 150);
    });
  }, []);

  useEffect(() => {
    if (isNewChat && isSuccess) {
      patchNewChat(chatId);
    }
  }, [isNewChat, isSuccess, chatId]);

  return (
    <AppKeyboardControllerView>
      {shouldHideContent && (
        <View className='absolute w-full h-full z-50 bg-background-primary items-center justify-center'>
          <AppSpinner />
        </View>
      )}
      {/* NOTE: Needs hide heavy component until navigation transition is finished, otherwise it slows down the navigation */}

      {isChatVisible && (
        <React.Suspense fallback={null}>
          <LazyChatMessagesList
            onEditPress={startEditing}
            chatId={chatId}
            isInputFocusing={isInputFocusing}
            messages={chat?.chat.messages ?? []}
            history={history}
            onLayout={handleChatMessagesListLayout}
            isMessagesListLoaded={isMessagesListLoaded}
            editingMessageId={editingMessageId}
            modelId={selectedModelId}
          />
        </React.Suspense>
      )}
      <View className={cn('pb-safe android:pb-16 pt-8 px-16', shouldHideContent && 'opacity-0')}>
        {editingMessageId ? (
          <EditMessageInput
            control={editMessageControl}
            name='editMessageInputValue'
            autoFocus={true}
            onSave={saveMessage}
            onCancel={cancelEditing}
            onSend={sendEditedMessage}
            isAiMessage={history?.messages[editingMessageId]?.role === Role.ASSISTANT}
          />
        ) : (
          <FormChatInput
            placeholder={translate('TEXT_INPUT_PLACEHOLDER')}
            control={control}
            onFocus={handleInputFocus}
            name='inputValue'
            onSubmit={onSubmit}
            isLoading={isSending || !isSocketConnected || isResponseGenerating}
            attachedFiles={attachedFiles}
            onFileUploaded={handleFileUploaded}
            onDeleteFilePress={handleDeleteFile}
            attachedImages={attachedImages}
            onImageUploaded={handleImageUploaded}
            onDeleteImagePress={handleDeleteImage}
            chatId={chatId}
            modelId={selectedModelId}
          />
        )}
      </View>
    </AppKeyboardControllerView>
  );
}
