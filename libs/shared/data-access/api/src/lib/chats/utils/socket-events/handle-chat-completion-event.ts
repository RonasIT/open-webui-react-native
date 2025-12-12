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

export const handleChatCompletionEvent = async (socketResponse: ChatEventBase): Promise<void> => {
  const sessionId = socketService.socketSessionId;
  const chatId = socketResponse.chatId;

  const chatCompletionData = plainToInstance(ChatCompletionChunk, socketResponse.data.data);
  if (!chatCompletionData) return;

  const queryKey = chatQueriesKeys.get(chatId).queryKey;
  const chatData = queryClient.getQueryData<ChatResponse>(queryKey);

  if (!chatData) return;

  // Save sources only from the first chunk
  if (chatCompletionData.sources) {
    sourcesStore[chatId] = chatCompletionData.sources;
  }

  const storedSources = sourcesStore[chatId];

  if (chatCompletionData.content) {
    queryClient.setQueryData(queryKey, (oldData: ChatResponse) => {
      const withGenerating = markCurrentMessageGenerating(oldData);

      return patchChatMessagesWithCompletion(withGenerating, chatCompletionData.content, storedSources);
    });
  }

  if (chatCompletionData.done) {
    delete sourcesStore[chatId];

    queryClient.setQueryData(queryKey, (oldData: ChatResponse) => {
      return patchCompletedMessage(oldData);
    });

    handleCompletedChat(chatCompletionData.content, chatId, sessionId, storedSources);
  }
};
