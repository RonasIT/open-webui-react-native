import { plainToInstance } from 'class-transformer';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import {
  ChatEventBase,
  ChatCompletionChunk,
  getOutputText,
  socketService,
} from '@open-webui-react-native/shared/data-access/websocket';
import { chatQueriesKeys } from '../../chat-queries-keys';
import { ChatResponse } from '../../models';
import { handleCompletedChat } from '../handle-completed-chat';
import { patchChatMessagesWithCompletion } from '../patch-chat-message-with-completion';
import { patchCompletedMessage } from '../patch-completed-message';

// NOTE: We get the source info only in the first chunk, so we need to save it until the AI response is fully generated.
const sourcesStore: Record<string, ChatCompletionChunk['sources']> = {};
const flushScheduled: Record<string, boolean> = {};
const contentBuffer: Record<string, string> = {};
// NOTE: Buffer the raw `output` array so it can be persisted on the message. The backend seeds
// "Continue Response" from the stored `output`; if we drop it, continue starts from scratch.
const outputBuffer: Record<string, ChatCompletionChunk['output']> = {};

export const handleChatCompletionEvent = async (socketResponse: ChatEventBase): Promise<void> => {
  const sessionId = socketService.socketSessionId;
  const chatId = socketResponse.chatId;

  const chatCompletionData = plainToInstance(ChatCompletionChunk, socketResponse.data.data);

  if (chatCompletionData.sources) {
    sourcesStore[chatId] = chatCompletionData.sources;
  }

  // NOTE: Since Open WebUI 0.11.0 the completion stream delivers assistant text inside an
  // `output` array (Responses API format) instead of a flat `content` string. Fall back to it
  // so streamed content renders and — importantly — the terminal `done` event below still runs.
  const content = chatCompletionData.content || getOutputText(chatCompletionData.output);

  if (chatCompletionData.output) {
    outputBuffer[chatId] = chatCompletionData.output;
  }

  const queryKey = chatQueriesKeys.get(chatId).queryKey;
  const storedSources = sourcesStore[chatId];

  if (content) {
    contentBuffer[chatId] = content;

    const chatData = queryClient.getQueryData<ChatResponse>(queryKey);

    // NOTE: Limit updates to once per frame (~16ms) because frequent streaming updates
    // can cause UI unresponsiveness on low-end Android devices.
    if (!flushScheduled[chatId] && chatData) {
      flushScheduled[chatId] = true;

      requestAnimationFrame(() => {
        flushScheduled[chatId] = false;

        queryClient.setQueryData(queryKey, (oldData: ChatResponse) =>
          patchChatMessagesWithCompletion(oldData, contentBuffer[chatId], storedSources, outputBuffer[chatId]),
        );
      });
    }
  }

  if (chatCompletionData.done) {
    delete sourcesStore[chatId];

    queryClient.setQueryData(queryKey, (oldData: ChatResponse) => patchCompletedMessage(oldData));
    handleCompletedChat(contentBuffer[chatId] ?? content, chatId, sessionId, storedSources, outputBuffer[chatId]);
    delete outputBuffer[chatId];
  }
};
