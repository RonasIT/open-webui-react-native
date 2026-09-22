import { mapValues, merge } from 'lodash-es';
import { MessageSource } from '@open-webui-react-native/shared/data-access/common';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { chatQueriesKeys } from '../chat-queries-keys';
import { Chat, ChatResponse, History, Message } from '../models';
import { chatService } from '../service';
import { getCompletionFiles } from './get-completion-files';
import { prepareOutputForSave } from './prepare-output-for-save';
import { isTemporaryChatId } from './temporary-chat-id';

// NOTE: Deliberately does not call `POST /chat/completed`. The app supports Open WebUI 0.10 and
// newer, and since 0.9.0 the backend runs outlet filters inline during the completion and persists
// the assistant message itself — the web client dropped the call in that same release, leaving it
// for external integrations only. Calling it re-ran the filters on a payload this client discards,
// and the endpoint turns every internal error into a 400 (a missing `model`, a stale `session_id`,
// a throwing filter), which used to abort the chat update below.
export const handleCompletedChat = async (
  message: string,
  chatId: string,
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

  // NOTE: Applied to every message, not just the one that finished: the whole history is posted, so
  // an older message would be rewritten from its parsed instance and lose the field names the
  // backend expects. Done last, after the merge, so nothing puts the parsed shape back.
  const withSavableOutput = (msg: Message): Message => ({ ...msg, output: prepareOutputForSave(msg.output) });

  const updatedHistory = new History({
    messages: mapValues(merge(updatedMessageMap, chatData.chat.history.messages), withSavableOutput),
    currentId: chat.history.currentId,
  });

  const files = getCompletionFiles(chat.messages);

  const updateChatPayload = new Chat({
    messages: updatedMessages.map(withSavableOutput),
    history: updatedHistory,
    files,
  });

  await chatService.update({ id: chatId, chat: updateChatPayload });
};
