import { History, Message } from '../models';

export const createMessagesList = (history: History, messageId: string): Array<Message> => {
  if (messageId === null || !history.messages[messageId]) {
    return [];
  }

  const message = history.messages[messageId];

  if (message === undefined) {
    return [];
  }

  if (message?.parentId) {
    return [...createMessagesList(history, message.parentId), message];
  } else {
    return [message];
  }
};
