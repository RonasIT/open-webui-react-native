import { Message, History } from '../models';

export function buildMessagesHistory(
  existingMessages: Record<string, Message>,
  userMessage: Message,
  assistantMessage: Message,
  assistantMessageId: string,
): History {
  return new History({
    messages: {
      ...existingMessages,
      [userMessage.id]: userMessage,
      [assistantMessage.id]: assistantMessage,
    },
    currentId: assistantMessageId,
  });
}
