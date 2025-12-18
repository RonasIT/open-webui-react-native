import { History, Message } from '../models';
import { createMessagesList } from './create-messages-list';

export function createRegenerationMessages(
  history: History,
  userMessageId: string,
  suggestionPrompt?: string,
): Array<Message> {
  const base = createMessagesList(history, userMessageId);

  if (!suggestionPrompt) {
    return base;
  }

  return base.map((msg, idx) => {
    if (idx === base.length - 1 && msg.role === 'user') {
      return {
        ...msg,
        content: `${msg.content}\n\n${suggestionPrompt}`,
      };
    }

    return msg;
  });
}
