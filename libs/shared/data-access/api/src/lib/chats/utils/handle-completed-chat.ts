import { merge, uniqBy } from 'lodash-es';
import { AttachedFile, FileType, MessageSource } from '@open-webui-react-native/shared/data-access/common';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { chatQueriesKeys } from '../chat-queries-keys';
import { Chat, ChatResponse, History, Message } from '../models';
import { chatService } from '../service';
import { prepareCompletedChatPayload } from './prepare-completed-chat-payload';
import { isTemporaryChatId } from './temporary-chat-id';

export const handleCompletedChat = async (
  message: string,
  chatId: string,
  sessionId: string,
  sources?: Array<MessageSource>,
  output?: Message['output'],
): Promise<void> => {
  // NOTE: Temporary chats are never persisted — the completed message is already reflected in the
  // cache by patchCompletedMessage (see handleChatCompletionEvent), so there's nothing left to do.
  if (isTemporaryChatId(chatId)) {
    return;
  }

  const chatData = queryClient.getQueryData<ChatResponse>(chatQueriesKeys.get(chatId).queryKey);

  if (!chatData) {
    return;
  }

  const { chat } = chatData;

  // NOTE: Persist `output` alongside `content`. The backend replaces the whole message object on
  // save (merge_history), so dropping `output` here wipes it server-side — which breaks
  // "Continue Response" (the backend seeds continuation from the stored `output`).
  const updatedMessages = chat.messages.map((msg, i, arr) =>
    i === arr.length - 1 ? { ...msg, content: message, output: output ?? msg.output, done: true, sources } : msg,
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
