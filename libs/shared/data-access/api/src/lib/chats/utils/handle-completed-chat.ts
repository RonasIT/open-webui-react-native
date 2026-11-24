import { merge } from 'lodash-es';
import { MessageSource } from '@open-webui-react-native/shared/data-access/common';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { chatQueriesKeys } from '../chat-queries-keys';
import { Chat, ChatResponse, History, Message } from '../models';
import { chatService } from '../service';
import { getCompletionFiles } from './get-completion-files';
import { isTemporaryChatId } from './temporary-chat-id';

// NOTE: Deliberately does not call `POST /chat/completed`. The app supports Open WebUI 0.10 and
// newer, and since 0.9.0 the backend runs outlet filters inline during the completion and persists
// the assistant message itself — the web client dropped the call in that same release, leaving it
// for external integrations only. Calling it re-ran the filters on a payload this client discards,
// and the endpoint turns every internal error into a 400 (a missing `model`, a stale `session_id`,
// a throwing filter), which used to abort the chat update below.
// NOTE: `not-ready` means the chat is gone from the query cache, so a POST cannot be built yet —
// callers that retry must keep the payload, not treat this as a successful save.
export type HandleCompletedChatResult = 'saved' | 'skipped' | 'not-ready';

export const handleCompletedChat = async (
  message: string,
  chatId: string,
  sources?: Array<MessageSource>,
  output?: Message['output'],
): Promise<HandleCompletedChatResult> => {
  // NOTE: Temporary chats are never persisted — the completed message is already reflected in the
  // cache by patchCompletedMessage (see handleChatCompletionEvent), so there's nothing left to do.
  if (isTemporaryChatId(chatId)) {
    return 'skipped';
  }

  const chatData = queryClient.getQueryData<ChatResponse>(chatQueriesKeys.get(chatId).queryKey);

  if (!chatData) {
    return 'not-ready';
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

  const files = getCompletionFiles(chat.messages);

  const updateChatPayload = new Chat({
    messages: updatedMessages,
    history: updatedHistory,
    files,
  });

  await chatService.update({ id: chatId, chat: updateChatPayload });

  return 'saved';
};
