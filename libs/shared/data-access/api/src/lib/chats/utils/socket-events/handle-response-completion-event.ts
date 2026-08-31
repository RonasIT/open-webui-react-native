import { plainToInstance } from 'class-transformer';
import {
  applyResponseStreamEvent,
  ChatEventBase,
  getResponseStreamText,
  ResponseStreamEvent,
} from '@open-webui-react-native/shared/data-access/websocket';
import { getChatStreamBuffer, scheduleChatStreamFlush } from './chat-stream-buffers';

// NOTE: `response:completion` is emitted by Open WebUI 0.11.1+ only. Unlike `chat:completion` its
// payload is an *increment* — a Responses-API delta event — so the text is accumulated rather than
// replaced. The terminal `done` signal still arrives via `chat:completion`, so nothing here
// completes the message.
export const handleResponseCompletionEvent = (socketResponse: ChatEventBase): void => {
  const chatId = socketResponse.chatId;
  const event = plainToInstance(ResponseStreamEvent, socketResponse.data.data);
  const buffer = getChatStreamBuffer(chatId);

  if (!applyResponseStreamEvent(buffer.streamState, event)) {
    return;
  }

  if (event.response?.output) {
    buffer.output = event.response.output;
  }

  const content = getResponseStreamText(buffer.streamState);

  if (!content) {
    return;
  }

  buffer.content = content;
  scheduleChatStreamFlush(chatId);
};
