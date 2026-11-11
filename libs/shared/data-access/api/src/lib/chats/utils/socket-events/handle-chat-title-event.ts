import { plainToInstance } from 'class-transformer';
import dayjs from 'dayjs';
import { ChatEventBase, ChatTitleData } from '@open-webui-react-native/shared/data-access/websocket';
import { isServerVersionAtLeast } from '../../../app-configuration/utils/is-server-version-at-least';
import { chatService } from '../../service';
import { patchChatList } from '../patch-chat-list';
import { isTemporaryChatId } from '../temporary-chat-id';

// NOTE: Open WebUI 0.10.0–0.11.4 emits the assistant reply instead of the fallback title it saves,
// so the saved title is read back; remove with 0.11.4 support.
const getSavedTitle = async (chatId: string, eventTitle: string): Promise<string> => {
  if (isServerVersionAtLeast('0.12.0') || isTemporaryChatId(chatId)) {
    return eventTitle;
  }

  try {
    return (await chatService.get(chatId)).title;
  } catch {
    return eventTitle;
  }
};

export const handleChatTitleEvent = async (socketResponse: ChatEventBase): Promise<void> => {
  const chatTitleData = plainToInstance(ChatTitleData, socketResponse.data);

  patchChatList({
    id: socketResponse.chatId,
    title: await getSavedTitle(socketResponse.chatId, chatTitleData.data),
    updatedAt: dayjs(),
  });
};
