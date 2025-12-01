import { Chat, createMessagesList } from '@open-webui-react-native/shared/data-access/api';

export const getChatAsText = (chat: Chat): string => {
  const messages = createMessagesList(chat.history, chat.history.currentId);

  const chatText = messages.reduce((acc, message) => {
    return `${acc}### ${message.role.toUpperCase()}\n${message.content}\n\n`;
  }, '');

  return chatText.trim();
};
