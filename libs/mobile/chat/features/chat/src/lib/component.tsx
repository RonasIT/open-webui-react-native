import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import dayjs from 'dayjs';
import { delay } from 'lodash-es';
import React, { Fragment, ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { InteractionManager } from 'react-native';
import { EditMessageInput } from '@open-webui-react-native/mobile/chat/features/edit-message-input';
import { FormChatInput, FormChatInputSchema } from '@open-webui-react-native/mobile/chat/features/form-chat-input';
import { SuggestChangeInput } from '@open-webui-react-native/mobile/chat/features/suggest-change-input';
import { useEditMessage } from '@open-webui-react-native/mobile/chat/features/use-edit-message';
import { useSendMessage } from '@open-webui-react-native/mobile/chat/features/use-send-message';
import { useSuggestChange } from '@open-webui-react-native/mobile/chat/features/use-suggest-change';
import { useAttachedFiles } from '@open-webui-react-native/mobile/shared/features/use-attached-files';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppKeyboardStickyView, AppSpinner, AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { FormValues } from '@open-webui-react-native/mobile/shared/utils/form';
import {
  authApi,
  chatApi,
  ChatGenerationOption,
  chatQueriesKeys,
  createMessagesList,
  getPendingToolCall,
  isTemporaryChatId,
  usersApi,
} from '@open-webui-react-native/shared/data-access/api';
import { FileData, ImageData, Role } from '@open-webui-react-native/shared/data-access/common';
import { useSubscribeToQueryCache } from '@open-webui-react-native/shared/data-access/query-client';
import { webSocketConfig, webSocketState$ } from '@open-webui-react-native/shared/data-access/websocket';
import { AnalyticsEvent, analyticsService } from '@open-webui-react-native/shared/utils/analytics-service';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { useAppStateChange } from '@open-webui-react-native/shared/utils/use-app-state-change';
import { ActiveInputMode } from './enums';
import { patchNewChat, requestStoreReview } from './utils';

const LazyChatMessagesList = React.lazy(() => import('./components/messages-list/component'));

interface ChatProps {
  chatId: string;
  resetToChatsList: () => void;
  selectedModelId?: string;
  isNewChat?: boolean;
}

export function Chat({ chatId, selectedModelId, isNewChat, resetToChatsList }: ChatProps): ReactElement {
  const translate = useTranslation('CHAT.CHAT');
  const translateRegeneratePrompt = useTranslation('CHAT.AI_MESSAGE_ACTIONS.REGENERATE_MESSAGE_ACTION_SHEET');

  const [isInputFocusing, setIsInputFocusing] = useState(false); //NOTE: Needs to avoid ChatBottomButton jumping when auto-scrolling after focus

  const isSocketConnected = useSelector(webSocketState$.isSocketConnected);
  const { data: userSettings } = usersApi.useGetUserSettings();
  const isMessageQueueEnabled = userSettings?.ui.enableMessageQueue ?? true;

  const [isMessagesListLoaded, setIsMessagesListLoaded] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [activeInputMode, setActiveInputMode] = useState<ActiveInputMode | null>(null);
  const [inputRerenderKey, setInputRerenderKey] = useState(0);
  const [queuedMessage, setQueuedMessage] = useState<{
    inputValue: string;
    options: Array<ChatGenerationOption>;
    attachedFiles: Array<FileData>;
    attachedImages: Array<ImageData>;
  } | null>(null);

  const {
    attachedFiles,
    attachedImages,
    handleImageUploaded,
    handleDeleteImage,
    handleFileUploaded,
    handleDeleteFile,
    resetAttachments,
  } = useAttachedFiles();

  const isTemporaryChat = isTemporaryChatId(chatId);
  // NOTE: Temporary chats are never persisted, so there's nothing to fetch — read the client-seeded cache only.
  const {
    data: chat,
    refetch,
    isLoading,
    isRefetching,
    isSuccess,
  } = chatApi.useGet(chatId, { enabled: !isTemporaryChat });
  const { data: profile } = authApi.useGetProfile();
  const { sendMessage, isLoading: isSending } = useSendMessage({ chatData: chat });

  // NOTE: Only the owner may post into a chat: the backend rejects a completion in somebody else's
  // chat with a 404 no matter what the shared folder grants, so a chat opened from a folder shared
  // with the user is read-only for them — the web client replaces its composer the same way.
  const isReadonly = Boolean(chat?.userId && profile && chat.userId !== profile.id);
  const {
    editingMessageId,
    startEditing,
    cancelEditing,
    control: editMessageControl,
    saveMessage,
    sendEditedMessage,
  } = useEditMessage({ chat, modelId: selectedModelId });

  const {
    suggestingMessageId,
    startSuggesting,
    cancelSuggesting,
    control: suggestMessageControl,
    submitSuggestion,
    regenerateWithSuggestion,
  } = useSuggestChange({ chat, modelId: selectedModelId });

  const history = chat?.chat.history;
  // NOTE: chat.messages is a legacy snapshot the backend no longer maintains, so the current branch is derived from history
  const messages = useMemo(() => (history ? createMessagesList(history, history.currentId) : []), [history]);
  const currentMessage = history?.messages[history.currentId];
  // NOTE: Two states keep `done: false` while nothing is actually being generated, and both hang the
  // spinner, the Stop button and the composer unless excluded here: a turn paused on tool approval
  // (the backend is waiting for the user), and a failed turn — the backend persists the error on the
  // message but never sets `done`, so reopening the chat brings the stuck state right back.
  const isAwaitingToolApproval = Boolean(getPendingToolCall(currentMessage));

  const hasFailed = Boolean(currentMessage?.error?.content);
  const isResponseGenerating = !currentMessage?.done && !isAwaitingToolApproval && !hasFailed;
  const isAssistantMessage = currentMessage?.role === Role.ASSISTANT;

  // NOTE: With message queueing enabled, a generating response no longer force-disables the text input —
  // the user can keep typing and submit the next message immediately (queued via `queuedMessage`). The
  // Stop button (isResponseGenerating prop below) still renders regardless, alongside the send button.
  const isComposerBlockedByGeneration = isResponseGenerating && !isMessageQueueEnabled;

  const firstMessageGeneratedRef = useRef(false);

  const shouldHideContent = isLoading || isRefetching || !isMessagesListLoaded || !selectedModelId;

  useSubscribeToQueryCache({
    eventType: 'removed',
    queryKey: chatQueriesKeys.get(chatId).queryKey,
    onQueryChange: resetToChatsList,
  });

  useAppStateChange({
    onChange: (lastStatusChangeTimeStamp) => {
      if (
        !isTemporaryChat &&
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

  const handleStartEditing = (messageId: string, content: string): void => {
    if (activeInputMode === ActiveInputMode.SUGGEST) cancelSuggesting();

    startEditing(messageId, content);
    setActiveInputMode(ActiveInputMode.EDIT);
  };

  const handleStartSuggesting = (messageId: string): void => {
    if (activeInputMode === ActiveInputMode.EDIT) cancelEditing();

    startSuggesting(messageId);
    setActiveInputMode(ActiveInputMode.SUGGEST);
  };

  const cancelEditingWrapper = (): void => {
    cancelEditing();
    setActiveInputMode(null);
  };

  const cancelSuggestingWrapper = (): void => {
    cancelSuggesting();
    setActiveInputMode(null);
  };

  const handleQuickSuggestion = (messageId: string, message: string): void => {
    // NOTE: Quick suggestions should not open the suggest input, they should immediately trigger regeneration
    void regenerateWithSuggestion(messageId, message);
  };

  const handleTryAgain = (messageId: string): void => {
    handleQuickSuggestion(messageId, '');
  };

  const handleAddDetails = (messageId: string): void => {
    handleQuickSuggestion(messageId, translateRegeneratePrompt('TEXT_ADD_DETAILS'));
  };

  const handleMoreConcise = (messageId: string): void => {
    handleQuickSuggestion(messageId, translateRegeneratePrompt('TEXT_MORE_CONCISE'));
  };

  const onSubmit = (options: Array<ChatGenerationOption>): Promise<void> =>
    handleSubmit(({ inputValue }: FormValues<FormChatInputSchema>): void => {
      if (!selectedModelId) {
        return ToastService.showError(translate('TEXT_MODEL_NOT_SELECTED'));
      }

      if (options.includes(ChatGenerationOption.IMAGE_GENERATION)) {
        analyticsService.trackEvent(AnalyticsEvent.GENERATE_IMAGE_USED);
      }

      if (isResponseGenerating && isMessageQueueEnabled) {
        // NOTE: Snapshot attachments now — they're cleared by resetAttachments() below and must not
        // be re-read live when this queued message is flushed later.
        setQueuedMessage({
          inputValue,
          options,
          attachedFiles: attachedFiles.get(),
          attachedImages: attachedImages.get(),
        });
        ToastService.show(translate('TEXT_MESSAGE_QUEUED'));
      } else {
        sendMessage(inputValue, selectedModelId, options, attachedFiles.get(), attachedImages.get());
      }

      analyticsService.trackEvent(AnalyticsEvent.MESSAGE_SENT, { modelId: selectedModelId });
      reset();
      resetAttachments();
      // NOTE: Forces input rerender to reset it to its initial height after submit
      setInputRerenderKey((key) => key + 1);
    })();

  const handleFollowUpPress = (text: string): void => {
    if (!selectedModelId) {
      return ToastService.showError(translate('TEXT_MODEL_NOT_SELECTED'));
    }

    cancelEditing();
    cancelSuggesting();
    setActiveInputMode(null);

    sendMessage(text, selectedModelId);
  };

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

  useEffect(() => {
    if (!isResponseGenerating && queuedMessage && selectedModelId) {
      sendMessage(
        queuedMessage.inputValue,
        selectedModelId,
        queuedMessage.options,
        queuedMessage.attachedFiles,
        queuedMessage.attachedImages,
      );
      setQueuedMessage(null);
    }
  }, [isResponseGenerating, queuedMessage, selectedModelId, sendMessage]);

  useEffect(() => {
    if (isNewChat && !firstMessageGeneratedRef.current && isAssistantMessage && currentMessage.done) {
      firstMessageGeneratedRef.current = true;
      requestStoreReview(chatId);
    }
  }, [isNewChat, chatId, currentMessage?.done, isAssistantMessage]);

  return (
    <Fragment>
      {shouldHideContent && (
        <View className='absolute w-full h-full z-50 bg-background-primary items-center justify-center'>
          <AppSpinner />
        </View>
      )}
      {/* NOTE: Needs hide heavy component until navigation transition is finished, otherwise it slows down the navigation */}

      {isChatVisible && (
        <React.Suspense fallback={null}>
          <LazyChatMessagesList
            onEditPress={handleStartEditing}
            onSuggestPress={handleStartSuggesting}
            onTryAgain={handleTryAgain}
            onAddDetails={handleAddDetails}
            onMoreConcise={handleMoreConcise}
            chatId={chatId}
            isInputFocusing={isInputFocusing}
            messages={messages}
            history={history}
            onLayout={handleChatMessagesListLayout}
            isMessagesListLoaded={isMessagesListLoaded}
            editingMessageId={editingMessageId}
            onFollowUpPress={handleFollowUpPress}
            isResponseGenerating={isResponseGenerating}
          />
        </React.Suspense>
      )}
      <AppKeyboardStickyView className='bg-background-primary-transparent'>
        <View className={cn('pt-8 px-16', shouldHideContent && 'opacity-0')}>
          {isReadonly ? (
            <View className='pb-16 pt-8'>
              <AppText className='text-sm-sm sm:text-sm text-text-secondary text-center'>
                {translate('TEXT_READ_ONLY')}
              </AppText>
            </View>
          ) : activeInputMode === ActiveInputMode.EDIT && editingMessageId ? (
            <EditMessageInput
              control={editMessageControl}
              name='editMessageInputValue'
              autoFocus={true}
              onSave={saveMessage}
              onCancel={cancelEditingWrapper}
              onSend={sendEditedMessage}
              isAiMessage={history?.messages[editingMessageId]?.role === Role.ASSISTANT}
            />
          ) : activeInputMode === ActiveInputMode.SUGGEST && suggestingMessageId ? (
            <SuggestChangeInput
              control={suggestMessageControl}
              name='suggestionInputValue'
              autoFocus
              onCancel={cancelSuggestingWrapper}
              onSend={submitSuggestion}
            />
          ) : (
            <FormChatInput
              placeholder={translate('TEXT_INPUT_PLACEHOLDER')}
              control={control}
              onFocus={handleInputFocus}
              name='inputValue'
              onSubmit={onSubmit}
              isLoading={isSending || !isSocketConnected || isComposerBlockedByGeneration}
              attachedFiles={attachedFiles}
              onFileUploaded={handleFileUploaded}
              onDeleteFilePress={handleDeleteFile}
              attachedImages={attachedImages}
              onImageUploaded={handleImageUploaded}
              onDeleteImagePress={handleDeleteImage}
              modelId={selectedModelId}
              isResponseGenerating={isResponseGenerating}
              isMessageQueueEnabled={isMessageQueueEnabled}
              inputRerenderKey={inputRerenderKey}
              chat={chat}
            />
          )}
        </View>
      </AppKeyboardStickyView>
    </Fragment>
  );
}
