import { plainToInstance } from 'class-transformer';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import {
  ChatEventBase,
  ChatCompletionChunk,
  socketService,
} from '@open-webui-react-native/shared/data-access/websocket';
import { chatQueriesKeys } from '../../chat-queries-keys';
import { ChatResponse } from '../../models';
import { handleCompletedChat } from '../handle-completed-chat';
import { patchChatMessagesWithCompletion } from '../patch-chat-message-with-completion';
import { patchCompletedMessage } from '../patch-completed-message';

// NOTE: We get the source info only in the first chunk, so we need to save it until the AI response is fully generated.
const sourcesStore: Record<string, ChatCompletionChunk['sources']> = {};
const flushScheduled: Record<string, boolean> = {};
const contentBuffer: Record<string, string> = {};

export const handleChatCompletionEvent = async (socketResponse: ChatEventBase): Promise<void> => {
  const sessionId = socketService.socketSessionId;
  const chatId = socketResponse.chatId;

  const chatCompletionData = plainToInstance(ChatCompletionChunk, socketResponse.data.data);

  if (chatCompletionData.sources) {
    sourcesStore[chatId] = chatCompletionData.sources;
  }

  if (!chatCompletionData?.content) return;
  contentBuffer[chatId] = chatCompletionData.content;

  const queryKey = chatQueriesKeys.get(chatId).queryKey;
  const chatData = queryClient.getQueryData<ChatResponse>(queryKey);
  const storedSources = sourcesStore[chatId];

  // NOTE: Limit updates to once per frame (~16ms) because frequent streaming updates
  // can cause UI unresponsiveness on low-end Android devices.
  if (!flushScheduled[chatId] && chatData) {
    flushScheduled[chatId] = true;

    requestAnimationFrame(() => {
      flushScheduled[chatId] = false;

      queryClient.setQueryData(queryKey, (oldData: ChatResponse) =>
        patchChatMessagesWithCompletion(oldData, contentBuffer[chatId], storedSources),
      );
    });
  }

  if (chatCompletionData.done) {
    delete sourcesStore[chatId];

    queryClient.setQueryData(queryKey, (oldData: ChatResponse) => patchCompletedMessage(oldData));
    handleCompletedChat(chatCompletionData.content, socketResponse.chatId, sessionId, storedSources);
  }
};
