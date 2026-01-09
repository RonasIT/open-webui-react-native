import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import { delay } from 'lodash-es';
import React, { ReactElement, useCallback, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { AiMessageActions } from '@open-webui-react-native/mobile/chat/features/ai-message-actions';
import { useManageMessageSiblings } from '@open-webui-react-native/mobile/chat/features/use-manage-messages-siblings';
import { UserMessageActions } from '@open-webui-react-native/mobile/chat/features/user-message-actions';
import { useSetSelectedModel } from '@open-webui-react-native/mobile/shared/features/use-set-selected-model';
import { View, AppFlashList } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
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
  history?: ChatHistory;
  messages?: Array<Message>;
  editingMessageId?: string;
}

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
}: ChatMessagesListProps): ReactElement {
  const listRef = useRef<React.ComponentRef<typeof FlashList<Message>>>(null);
  const isScrollToBottomAvailable = useRef(false);
  const isScrollToBottomAvailableTimeout = useRef<NodeJS.Timeout | null | number>(null); //NOTE: number needs to fix pipeline lint error
  const isScrollToBottomVisible = useSharedValue(0);
  const previousScrollY = useRef(0);
  const [autoscrollToBottomThreshold, setAutoscrollToBottomThreshold] = useState<number | undefined>(1);

  const { showPreviousSibling, showNextSibling, getSiblingsInfo } = useManageMessageSiblings(chatId, history);
  const { mutate: completeChat } = chatApi.useCompleteChat();
  const { id }: ChatScreenParams = useLocalSearchParams();
  const { modelId } = useSetSelectedModel(id);

  const handleContentSizeChange = (): void => {
    //NOTE: Needs to wait until the initial scroll to the bottom or content generation finished and not show the ChatBottomButton before
    isScrollToBottomAvailable.current = false;

    if (isScrollToBottomAvailableTimeout.current) {
      clearTimeout(isScrollToBottomAvailableTimeout.current);
    }
    isScrollToBottomAvailableTimeout.current = setTimeout(() => {
      isScrollToBottomAvailable.current = true;
    }, 500);

    if (!isMessagesListLoaded && listRef.current && messages?.length > 0) {
      delay(() => {
        listRef.current?.scrollToIndex({
          index: messages.length - 1,
          animated: false,
          viewPosition: 1,
        });
        delay(onLayout, 125);
      }, 125);
    }
  };

  const animateScrollToBottom = (value: number): void => {
    isScrollToBottomVisible.value = withTiming(value, { duration: 200 });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollY = contentOffset.y;
    const contentHeight = contentSize.height;
    const containerHeight = layoutMeasurement.height;

    const isScrollingUp = scrollY < previousScrollY.current;
    previousScrollY.current = scrollY;

    //NOTE: The indent of 100 is needed to display the button not immediately when we start scrolling,
    //but when a small distance has been scrolled.
    const isNearBottom = scrollY + containerHeight >= contentHeight - 100;

    if (isNearBottom || isScrollingUp) {
      animateScrollToBottom(0);
    } else if (isScrollToBottomAvailable.current && !isInputFocusing) {
      animateScrollToBottom(1);
    }
  };

  const scrollToBottom = (): void => {
    //NOTE: Needs to hide scroll to bottom button to avoid its jumping while scrolling to bottom
    animateScrollToBottom(0);
    isScrollToBottomAvailable.current = false;
    delay(() => {
      isScrollToBottomAvailable.current = true;
    }, 1000);

    listRef.current?.scrollToEnd({ animated: true });
  };

  const handleEditPress = (index: number, messageId: string, content: string): void => {
    setAutoscrollToBottomThreshold(undefined);
    onEditPress(messageId, content);
    delay(() => {
      listRef.current?.scrollToIndex({
        index: index,
        viewOffset: 20,
        animated: true,
      });
    }, 500);
    delay(() => {
      setAutoscrollToBottomThreshold(1);
    }, 1000);
  };

  const handleContinueResponsePress = (messageId: string): void => {
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
      messageId: messageId,
      sessionId: socketService.socketSessionId,
      model: modelId,
    });
    completeChat(completePayload);
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const message = history?.messages[item.id];
      if (!message) return null;

      const lastAssistantMessageInUIList = [...messages]
        .reverse()
        .find((m) => history?.messages[m.id]?.role === Role.ASSISTANT);

      const isLast = item.id === lastAssistantMessageInUIList?.id;

      return item.role === Role.ASSISTANT ? (
        <AiMessageActions
          message={message}
          onEditPress={onEditPress}
          onSuggestPress={onSuggestPress}
          onContinueResponsePress={handleContinueResponsePress}
          onTryAgain={onTryAgain}
          onAddDetails={onAddDetails}
          onMoreConcise={onMoreConcise}
          isLast={isLast}>
          <ChatAiMessage
            message={message}
            onEditPress={() => handleEditPress(index, message.id, message.content)}
            isEditing={editingMessageId === item.id}
            onPreviousSibling={showPreviousSibling}
            onNextSibling={showNextSibling}
            getSiblingsInfo={getSiblingsInfo}
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
      history,
      onEditPress,
      editingMessageId,
      showPreviousSibling,
      showNextSibling,
      getSiblingsInfo,
      modelId,
      onSuggestPress,
      onTryAgain,
      onAddDetails,
      onMoreConcise,
    ],
  );

  return (
    <View className='relative flex-1'>
      <AppFlashList<Message>
        ref={listRef}
        contentContainerClassName='pb-16 px-16'
        showsVerticalScrollIndicator={false}
        drawDistance={1500} //NOTE: Needs to avoid image jumping (while rerendering) when scrolling
        keyExtractor={(item) => item.id}
        getItemType={(item) => item.role}
        ItemSeparatorComponent={() => <View className='h-20' />}
        data={messages}
        renderItem={renderItem}
        // TODO: Add autoscrollToBottom logic when it implemented in lib
        maintainVisibleContentPosition={{
          startRenderingFromBottom: true,
          animateAutoScrollToBottom: true,
          autoscrollToBottomThreshold,
        }}
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      <ChatBottomButton isVisible={isScrollToBottomVisible} onPress={scrollToBottom} />
    </View>
  );
}
