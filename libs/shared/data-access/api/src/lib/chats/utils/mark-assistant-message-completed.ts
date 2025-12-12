import { ChatResponse, History } from '../models';

export function markAssistantMessageCompleted(chat: ChatResponse, messageId: string): ChatResponse {
  const history = chat.chat.history;
  const message = history.messages[messageId];
  if (!message) return chat;

  const updated = { ...message, done: true };

  const updatedHistory = new History({
    ...history,
    messages: {
      ...history.messages,
      [updated.id]: updated,
    },
  });

  return {
    ...chat,
    chat: {
      ...chat.chat,
      messages: chat.chat.messages.map((m) => (m.id === updated.id ? updated : m)),
      history: updatedHistory,
    },
  };
}
