import { plainToInstance } from 'class-transformer';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import {
  ChatEventBase,
  ChatCompletionChunk,
  getOutputText,
  seedResponseStreamState,
  socketService,
} from '@open-webui-react-native/shared/data-access/websocket';
import { hapticFeedbackService } from '@open-webui-react-native/shared/utils/haptic-feedback-service';
import { chatQueriesKeys } from '../../chat-queries-keys';
import { ChatResponse } from '../../models';
import { handleCompletedChat } from '../handle-completed-chat';
import { patchCompletedMessage } from '../patch-completed-message';
import {
  flushChatStreamBuffer,
  getChatStreamBuffer,
  resetChatStreamBuffer,
  scheduleChatStreamFlush,
} from './chat-stream-buffers';

// NOTE: `chat:completion` always carries a *snapshot* of the response so far, so its payload
// replaces the buffered content rather than being appended to it. Up to Open WebUI 0.11.0 this was
// the only streaming event; on 0.11.1 the text streams as deltas via `response:completion` and this
// event is left carrying the tool-call boundaries and the terminal `done`. Both remain authoritative,
// which is why a snapshot also re-seeds the delta accumulator.
export const handleChatCompletionEvent = async (socketResponse: ChatEventBase): Promise<void> => {
  const sessionId = socketService.socketSessionId;
  const chatId = socketResponse.chatId;

  const chatCompletionData = plainToInstance(ChatCompletionChunk, socketResponse.data.data);
  const buffer = getChatStreamBuffer(chatId);

  if (chatCompletionData.sources) {
    buffer.sources = chatCompletionData.sources;
  }

  if (chatCompletionData.output) {
    buffer.output = chatCompletionData.output;
    // NOTE: Delta `output_index` values are relative to this same array, so re-seeding by array
    // position keeps the deltas that follow a tool call aligned with what the server sent.
    buffer.streamState = seedResponseStreamState(chatCompletionData.output);
  }

  // NOTE: Backends up to 0.10.x deliver assistant text as a flat `content` string; 0.11.0+ deliver
  // it inside an `output` array (Responses API format). Fall back to the latter so streamed content
  // renders and — importantly — the terminal `done` branch below still runs.
  const content = chatCompletionData.content || getOutputText(chatCompletionData.output);

  if (content) {
    buffer.content = content;
  }

  // NOTE: A snapshot can change `output` without changing the visible text — a tool call awaiting
  // the user's approval arrives exactly like that. Flushing on `output` too is what lets the UI see
  // it; keying the flush off `content` alone left such a snapshot stuck in the buffer.
  if (content || chatCompletionData.output) {
    scheduleChatStreamFlush(chatId);
  }

  if (chatCompletionData.done) {
    // NOTE: Apply the buffered content synchronously — a pending frame would otherwise land after
    // the buffer is dropped below, leaving the message rendered without its final text.
    flushChatStreamBuffer(chatId);

    queryClient.setQueryData(chatQueriesKeys.get(chatId).queryKey, (oldData: ChatResponse) =>
      patchCompletedMessage(oldData),
    );
    handleCompletedChat(buffer.content, chatId, sessionId, buffer.sources, buffer.output);
    resetChatStreamBuffer(chatId);
    await hapticFeedbackService.trigger();
  }
};
