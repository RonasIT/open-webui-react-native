import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import { delay } from 'lodash-es';
import React, { ReactElement, useCallback, useMemo, useRef } from 'react';
import { GestureResponderEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollViewProps } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { AiMessageActions } from '@open-webui-react-native/mobile/chat/features/ai-message-actions';
import { useManageMessageSiblings } from '@open-webui-react-native/mobile/chat/features/use-manage-messages-siblings';
import { UserMessageActions } from '@open-webui-react-native/mobile/chat/features/user-message-actions';
import { useSetSelectedModel } from '@open-webui-react-native/mobile/shared/features/use-set-selected-model';
import { AppFlashList, AppKeyboardChatScrollView, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ChatScreenParams } from '@open-webui-react-native/mobile/shared/utils/navigation';
import {
  Chat,
  chatApi,
  History as ChatHistory,
  Message,
  patchChatQueryData,
  prepareCompleteChatPayload,
} from '@open-webui-react-native/shared/data-access/api';
import { Role } from '@open-webui-react-native/shared/data-access/common';
import { socketService } from '@open-webui-react-native/shared/data-access/websocket';
import { ChatAiMessage } from '../ai-message';
import { ChatBottomButton } from '../chat-bottom-button';
import { ChatUserMessage } from '../user-message';

interface ChatMessagesListProps {
  chatId: string;
  isMessagesListLoaded: boolean;
  onLayout: () => void;
  isInputFocusing: boolean;
  onEditPress: (messageId: string, content: string) => void;
  onSuggestPress: (messageId: string) => void;
  onTryAgain: (messageId: string) => void;
  onAddDetails: (messageId: string) => void;
  onMoreConcise: (messageId: string) => void;
  onFollowUpPress: (text: string) => void;
  isResponseGenerating: boolean;
  history?: ChatHistory;
  messages?: Array<Message>;
  editingMessageId?: string;
}

const MessagesListItemSeparator = (): ReactElement => <View className='h-20' />;

const messagesListKeyExtractor = (item: Message): string => item.id;

const messagesListGetItemType = (item: Message): Role => item.role;

export default function ChatMessagesList({
  chatId,
  history,
  messages = [],
  isMessagesListLoaded = false,
  onLayout,
  isInputFocusing,
  onEditPress,
  onSuggestPress,
  onTryAgain,
  onAddDetails,
  onMoreConcise,
  editingMessageId,
  onFollowUpPress,
  isResponseGenerating,
}: ChatMessagesListProps): ReactElement {
  const listRef = useRef<React.ComponentRef<typeof FlashList<Message>>>(null);
  const isScrollToBottomAvailable = useRef(false);
  const isScrollToBottomAvailableTimeout = useRef<NodeJS.Timeout | null | number>(null); //NOTE: number needs to fix pipeline lint error
  const isScrollToBottomVisible = useSharedValue(0);
  const previousScrollY = useRef(0);
  const shouldAutoscrollToBottomRef = useRef(true);
  const previousTouchY = useRef(0);

  const { showPreviousSibling, showNextSibling, getSiblingsInfo } = useManageMessageSiblings(chatId, history);
  const { mutate: completeChat } = chatApi.useCompleteChat();
  const { id }: ChatScreenParams = useLocalSearchParams();
  const { modelId } = useSetSelectedModel(id);

  const lastAssistantMessageId = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index--) {
      const messageId = messages[index]?.id;

      if (messageId && history?.messages[messageId]?.role === Role.ASSISTANT) {
        return messageId;
      }
    }

    return undefined;
  }, [history?.messages, messages]);

  const renderScrollComponent = useCallback((props: ScrollViewProps) => <AppKeyboardChatScrollView {...props} />, []);

  const handleContentSizeChange = useCallback((): void => {
    //NOTE: Needs to wait until the initial scroll to the bottom or content generation finished and not show the ChatBottomButton before
    isScrollToBottomAvailable.current = false;

    if (isScrollToBottomAvailableTimeout.current) {
      clearTimeout(isScrollToBottomAvailableTimeout.current);
    }
    isScrollToBottomAvailableTimeout.current = setTimeout(() => {
      isScrollToBottomAvailable.current = true;
    }, 500);

    if (shouldAutoscrollToBottomRef.current) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    }

    if (!isMessagesListLoaded && listRef.current && messages.length > 0) {
      delay(() => {
        listRef.current?.scrollToEnd({ animated: false });
        delay(onLayout, 125);
      }, 125);
    }
  }, [isMessagesListLoaded, messages.length, onLayout]);

  const animateScrollToBottom = useCallback(
    (value: number): void => {
      isScrollToBottomVisible.value = withTiming(value, { duration: 200 });
    },
    [isScrollToBottomVisible],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const scrollY = contentOffset.y;
      const contentHeight = contentSize.height;
      const containerHeight = layoutMeasurement.height;

      const isScrollingUp = scrollY < previousScrollY.current;
      previousScrollY.current = scrollY;

      //NOTE: The indent of 100 is needed to display the button not immediately when we start scrolling,
      //but when a small distance has been scrolled.
      const isNearBottom = scrollY + containerHeight >= contentHeight - 100;

      if (!isResponseGenerating) {
        shouldAutoscrollToBottomRef.current = isNearBottom;
      }

      if (isNearBottom || isScrollingUp) {
        animateScrollToBottom(0);
      } else if (isScrollToBottomAvailable.current && !isInputFocusing) {
        animateScrollToBottom(1);
      }
    },
    [animateScrollToBottom, isInputFocusing, isResponseGenerating],
  );

  const scrollToBottom = useCallback((): void => {
    //NOTE: Needs to hide scroll to bottom button to avoid its jumping while scrolling to bottom
    animateScrollToBottom(0);
    isScrollToBottomAvailable.current = false;

    delay(() => {
      isScrollToBottomAvailable.current = true;
    }, 1000);

    listRef.current?.scrollToEnd({ animated: true });
  }, [animateScrollToBottom]);

  const handleEditPress = useCallback(
    (index: number, messageId: string, content: string): void => {
      onEditPress(messageId, content);
      delay(() => {
        listRef.current?.scrollToIndex({
          index,
          viewOffset: 20,
          animated: true,
        });
      }, 500);
    },
    [onEditPress],
  );

  const handleContinueResponsePress = useCallback(
    (messageId: string): void => {
      if (!modelId) return;

      patchChatQueryData(chatId, {
        chat: {
          history: {
            messages: {
              [messageId]: {
                done: false,
              },
            },
          },
        } as Chat,
      });

      const completePayload = prepareCompleteChatPayload({
        chatId,
        messages,
        messageId,
        sessionId: socketService.socketSessionId,
        model: modelId,
      });
      completeChat(completePayload);
    },
    [chatId, completeChat, messages, modelId],
  );

  const handleFollowUpPress = useCallback(
    (text: string): void => {
      onFollowUpPress(text);
    },
    [onFollowUpPress],
  );

  const handleTouchStart = useCallback(
    (e: GestureResponderEvent): void => {
      if (!isResponseGenerating) return;

      shouldAutoscrollToBottomRef.current = false;
      previousTouchY.current = e.nativeEvent.pageY;
    },
    [isResponseGenerating],
  );

  const handleTouchMove = useCallback(
    (e: GestureResponderEvent): void => {
      if (!isResponseGenerating) return;

      const { pageY } = e.nativeEvent;
      const deltaY = pageY - previousTouchY.current;

      previousTouchY.current = pageY;
      shouldAutoscrollToBottomRef.current = deltaY < 0;
    },
    [isResponseGenerating],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const message = history?.messages[item.id];
      if (!message) return null;

      const isLast = item.id === lastAssistantMessageId;

      return item.role === Role.ASSISTANT ? (
        <AiMessageActions
          message={message}
          onEditPress={onEditPress}
          onSuggestPress={onSuggestPress}
          onContinueResponsePress={handleContinueResponsePress}
          onTryAgain={onTryAgain}
          onAddDetails={onAddDetails}
          onMoreConcise={onMoreConcise}
          isResponseGenerating={isResponseGenerating}
          isLast={isLast}>
          <ChatAiMessage
            message={message}
            onEditPress={() => handleEditPress(index, message.id, message.content)}
            isEditing={editingMessageId === item.id}
            onPreviousSibling={showPreviousSibling}
            onNextSibling={showNextSibling}
            getSiblingsInfo={getSiblingsInfo}
            isLast={isLast}
            onFollowUpPress={handleFollowUpPress}
            isResponseGenerating={isResponseGenerating}
          />
        </AiMessageActions>
      ) : (
        <UserMessageActions message={message} onEditPress={() => handleEditPress(index, message.id, message.content)}>
          <ChatUserMessage
            message={message}
            isEditing={editingMessageId === item.id}
            onPreviousSibling={showPreviousSibling}
            onNextSibling={showNextSibling}
            getSiblingsInfo={getSiblingsInfo}
          />
        </UserMessageActions>
      );
    },
    [
      editingMessageId,
      getSiblingsInfo,
      handleContinueResponsePress,
      handleEditPress,
      handleFollowUpPress,
      history?.messages,
      isResponseGenerating,
      lastAssistantMessageId,
      onAddDetails,
      onEditPress,
      onMoreConcise,
      onSuggestPress,
      onTryAgain,
      showNextSibling,
      showPreviousSibling,
    ],
  );

  return (
    <View className='relative flex-1'>
      <AppFlashList<Message>
        ref={listRef}
        contentContainerClassName='pb-[135] px-16'
        showsVerticalScrollIndicator={false}
        drawDistance={1500} //NOTE: Needs to avoid image jumping (while rerendering) when scrolling
        keyExtractor={messagesListKeyExtractor}
        getItemType={messagesListGetItemType}
        ItemSeparatorComponent={MessagesListItemSeparator}
        data={messages}
        renderItem={renderItem}
        maintainVisibleContentPosition={{
          startRenderingFromBottom: true,
        }}
        renderScrollComponent={renderScrollComponent}
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        scrollEventThrottle={16}
      />
      <ChatBottomButton isVisible={isScrollToBottomVisible} onPress={scrollToBottom} />
    </View>
  );
}
