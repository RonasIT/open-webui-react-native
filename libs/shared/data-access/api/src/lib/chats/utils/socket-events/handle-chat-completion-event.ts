import { plainToInstance } from 'class-transformer';
import { queryClient } from '@open-web-ui-mobile-client-react-native/shared/data-access/query-client';
import {
  ChatEventBase,
  ChatCompletionChunk,
  socketService,
} from '@open-web-ui-mobile-client-react-native/shared/data-access/websocket';
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

  if (chatCompletionData.sources) {
    sourcesStore[chatId] = chatCompletionData.sources;
  }

  if (!chatCompletionData?.content) return;

  const queryKey = chatQueriesKeys.get(chatId).queryKey;
  const chatData = queryClient.getQueryData<ChatResponse>(queryKey);
  const storedSources = sourcesStore[chatId];

  if (chatData) {
    queryClient.setQueryData(queryKey, (oldData: ChatResponse) =>
      patchChatMessagesWithCompletion(oldData, chatCompletionData.content, storedSources),
    );
  }

  if (chatCompletionData.done) {
    delete sourcesStore[chatId];

    queryClient.setQueryData(queryKey, (oldData: ChatResponse) => patchCompletedMessage(oldData));
    handleCompletedChat(chatCompletionData.content, socketResponse.chatId, sessionId, storedSources);
  }
};
