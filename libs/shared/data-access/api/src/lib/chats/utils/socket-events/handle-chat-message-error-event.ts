import { plainToInstance } from 'class-transformer';
import { ChatEventBase, ChatMessageErrorData } from '@open-webui-react-native/shared/data-access/websocket';
import { Chat } from '../../models';
import { patchChatQueryData } from '../patch-get-chat-query';
import { flushChatStreamBuffer, resetChatStreamBuffer } from './chat-stream-buffers';

// NOTE: A failed turn ends with this event and nothing else — the backend never follows it with a
// terminal `chat:completion`, so `done` has to be set here. Without it the message stays "generating"
// forever: the spinner keeps running, the Stop button stays up and the composer stays blocked.
export const handleChatMessageErrorEvent = (socketResponse: ChatEventBase): void => {
  const { chatId, messageId } = socketResponse;
  const socketData = plainToInstance(ChatMessageErrorData, socketResponse.data.data);

  // Keep whatever text streamed before the failure instead of dropping it with the buffer.
  flushChatStreamBuffer(chatId);

  patchChatQueryData(chatId, {
    chat: {
      history: {
        messages: {
          [messageId]: {
            done: true,
            error: socketData.error,
          },
        },
      },
    } as Chat,
  });

  resetChatStreamBuffer(chatId);
};
