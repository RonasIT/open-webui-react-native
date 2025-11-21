import { Role } from '@open-webui-react-native/shared/data-access/common';
import { CompletedChat, Message } from '../models';

export function prepareCompletedChatPayload(
  chatId: string,
  id: string,
  messages: Array<Message>,
  model: string,
  sessionId: string,
  generatedMessage: string,
): CompletedChat {
  const preparedMessages = messages.reduce<
    Array<{
      content: string;
      id: string;
      role: Role;
      timestamp: number;
    }>
  >((acc, m, index) => {
    const isLast = index === messages.length - 1;

    acc.push({
      content: isLast ? generatedMessage : m.content,
      id: m.id,
      role: m.role,
      timestamp: m.timestamp,
    });

    return acc;
  }, []);

  return new CompletedChat({
    chatId,
    id,
    messages: preparedMessages,
    model,
    sessionId,
  });
}
