import { ChatResponse, History } from '../models';

export const patchCompletedMessage = (chat: ChatResponse): ChatResponse => {
  const history = chat.chat.history;
  const lastAssistant = history.lastAssistantMessage;
  if (!lastAssistant) return chat;

  const updatedMessage = {
    ...lastAssistant,
    done: true,
  };

  return {
    ...chat,
    chat: {
      ...chat.chat,
      messages: chat.chat.messages.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)),
      history: new History({
        messages: {
          ...history.messages,
          [updatedMessage.id]: updatedMessage,
        },
        currentId: history.currentId,
      }),
    },
  };
};
