import { plainToInstance } from 'class-transformer';
import dayjs from 'dayjs';
import { ChatEventBase, ChatTitleData } from '@open-webui-react-native/shared/data-access/websocket';
import { patchChatList } from '../patch-chat-list';

export const handleChatTitleEvent = (socketResponse: ChatEventBase): void => {
  const chatTitleData = plainToInstance(ChatTitleData, socketResponse.data);

  patchChatList({
    id: socketResponse.chatId,
    title: chatTitleData.data,
    updatedAt: dayjs(),
  });
};
