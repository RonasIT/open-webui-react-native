import { MessageSource } from '@open-webui-react-native/shared/data-access/common';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import {
  ChatCompletionOutputItem,
  createResponseStreamState,
  ResponseStreamState,
} from '@open-webui-react-native/shared/data-access/websocket';
import { chatQueriesKeys } from '../../chat-queries-keys';
import { ChatResponse } from '../../models';
import { patchChatMessagesWithCompletion } from '../patch-chat-message-with-completion';

interface ChatStreamBuffer {
  content: string;
  // NOTE: The raw `output` array is buffered so it can be persisted on the message. The backend
  // seeds "Continue Response" from the stored `output`; if we drop it, continue starts from scratch.
  output?: Array<ChatCompletionOutputItem>;
  // NOTE: Sources arrive only in the first chunk, so they are kept until the response is complete.
  sources?: Array<MessageSource>;
  // NOTE: Reassembles the visible text from `response:completion` deltas (Open WebUI 0.11.1+).
  streamState: ResponseStreamState;
  frameHandle?: number;
}

const buffers: Record<string, ChatStreamBuffer> = {};

export const getChatStreamBuffer = (chatId: string): ChatStreamBuffer => {
  if (!buffers[chatId]) {
    buffers[chatId] = { content: '', streamState: createResponseStreamState() };
  }

  return buffers[chatId];
};

export const flushChatStreamBuffer = (chatId: string): void => {
  const buffer = buffers[chatId];

  if (!buffer) {
    return;
  }

  if (buffer.frameHandle !== undefined) {
    cancelAnimationFrame(buffer.frameHandle);
    buffer.frameHandle = undefined;
  }

  queryClient.setQueryData(chatQueriesKeys.get(chatId).queryKey, (oldData: ChatResponse) =>
    patchChatMessagesWithCompletion(oldData, buffer.content, buffer.sources, buffer.output),
  );
};

// NOTE: Limit updates to once per frame (~16ms) because frequent streaming updates
// can cause UI unresponsiveness on low-end Android devices.
export const scheduleChatStreamFlush = (chatId: string): void => {
  const buffer = getChatStreamBuffer(chatId);

  if (
    buffer.frameHandle !== undefined ||
    !queryClient.getQueryData<ChatResponse>(chatQueriesKeys.get(chatId).queryKey)
  ) {
    return;
  }

  buffer.frameHandle = requestAnimationFrame(() => {
    buffer.frameHandle = undefined;
    flushChatStreamBuffer(chatId);
  });
};

export const resetChatStreamBuffer = (chatId: string): void => {
  const buffer = buffers[chatId];

  if (buffer?.frameHandle !== undefined) {
    cancelAnimationFrame(buffer.frameHandle);
  }

  delete buffers[chatId];
};
