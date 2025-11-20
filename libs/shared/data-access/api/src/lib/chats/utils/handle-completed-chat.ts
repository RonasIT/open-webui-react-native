import { merge, uniqBy } from 'lodash-es';
import {
  AttachedFile,
  FileType,
  MessageSource,
} from '@open-web-ui-mobile-client-react-native/shared/data-access/common';
import { queryClient } from '@open-web-ui-mobile-client-react-native/shared/data-access/query-client';
import { chatQueriesKeys } from '../chat-queries-keys';
import { Chat, ChatResponse, History, Message } from '../models';
import { chatService } from '../service';
import { prepareCompletedChatPayload } from './prepare-completed-chat-payload';

export const handleCompletedChat = async (
  message: string,
  chatId: string,
  sessionId: string,
  sources?: Array<MessageSource>,
): Promise<void> => {
  const chatData = queryClient.getQueryData<ChatResponse>(chatQueriesKeys.get(chatId).queryKey);

  if (!chatData) {
    return;
  }

  const { chat } = chatData;

  const updatedMessages = chat.messages.map((msg, i, arr) =>
    i === arr.length - 1 ? { ...msg, content: message, done: true, sources } : msg,
  );

  const updatedMessageMap: Record<string, Message> = Object.fromEntries(updatedMessages.map((msg) => [msg.id, msg]));

  const updatedHistory = new History({
    messages: merge(updatedMessageMap, chatData.chat.history.messages),
    currentId: chat.history.currentId,
  });

  const completedChatPayload = prepareCompletedChatPayload(
    chatId,
    updatedHistory.currentId,
    updatedMessages,
    chat.models?.[0],
    sessionId,
    message,
  );

  // Only files should be included in `files` field
  const files = uniqBy(
    chat.messages.flatMap((msg) => msg.files ?? []).filter((file): file is AttachedFile => file.type === FileType.FILE),
    'id',
  );

  const updateChatPayload = new Chat({
    messages: updatedMessages,
    history: updatedHistory,
    files,
  });

  const data = await chatService.handleCompletedChat(completedChatPayload);
  chatService.update({ id: data.chatId, chat: updateChatPayload });
};
