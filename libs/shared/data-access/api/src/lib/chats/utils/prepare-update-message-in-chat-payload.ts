import { ChatResponse } from '../models';

export function prepareUpdateMessageInChatPayload(
  oldData: ChatResponse,
  messageId: string,
  newContent: string,
): ChatResponse {
  const messagesMap = { ...oldData.chat.history.messages };
  const message = messagesMap[messageId];

  messagesMap[messageId] = {
    ...message,
    content: newContent,
  };

  const messagesArray = oldData.chat.messages.map((msg) =>
    msg.id === messageId ? { ...messagesMap[messageId] } : msg,
  );

  const newChatData: ChatResponse = {
    ...oldData,
    chat: {
      ...oldData.chat,
      history: {
        ...oldData.chat.history,
        messages: messagesMap,
      },
      messages: messagesArray,
    },
  };

  return newChatData;
}
