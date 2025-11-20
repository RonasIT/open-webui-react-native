import { ChatResponse, History } from '../models';
import { buildMessagesHistory } from './build-messages-history';
import { createMessagePair } from './create-message-pair';
import { createMessagesList } from './create-messages-list';

export function prepareUpdateMessageToSendPayload(
  oldChat: ChatResponse,
  prompt: string,
  model: string,
  parentMessageId?: string | null,
): ChatResponse {
  const chatHistory = oldChat.chat.history;

  const { userMessage, assistantMessage, assistantMessageId } = createMessagePair({
    prompt,
    model,
    currentMessageId: parentMessageId || undefined,
  });

  const patchedMessages = { ...chatHistory.messages };

  if (parentMessageId && patchedMessages[parentMessageId]) {
    patchedMessages[parentMessageId] = {
      ...patchedMessages[parentMessageId],
      childrenIds: [...(patchedMessages[parentMessageId].childrenIds || []), userMessage.id],
    };
  }

  const updatedHistory = buildMessagesHistory(patchedMessages, userMessage, assistantMessage, assistantMessageId);
  const updatedMessagesList = createMessagesList(updatedHistory, assistantMessageId);

  const newChatData: ChatResponse = {
    ...oldChat,
    chat: {
      ...oldChat.chat,
      history: updatedHistory,
      messages: updatedMessagesList,
    },
  };

  return newChatData;
}
