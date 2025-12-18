import { socketService } from '@open-webui-react-native/shared/data-access/websocket';
import { ChatGenerationOption } from '../enums';
import { ChatResponse, CompleteChatRequest } from '../models';
import { createRegenerationMessages } from './create-regeneration-messages';
import { prepareCompleteChatPayload } from './prepare-complete-chat-payload';

export function prepareRegeneratePayload({
  chat,
  messageId,
  model,
  suggestionPrompt,
  generationOptions,
}: {
  chat: ChatResponse;
  messageId: string;
  model: string;
  suggestionPrompt?: string;
  generationOptions?: Array<ChatGenerationOption>;
}): CompleteChatRequest {
  const history = chat.chat.history;

  return prepareCompleteChatPayload({
    chatId: chat.id,
    messageId,
    messages: createRegenerationMessages(history, messageId, suggestionPrompt),
    sessionId: socketService.socketSessionId,
    model,
    generationOptions,
  });
}
