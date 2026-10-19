import { Role } from '@open-webui-react-native/shared/data-access/common';
import { getOutputText } from '@open-webui-react-native/shared/data-access/websocket';
import { ChatResponse } from '../models';

// NOTE: Prepares a chat loaded from the backend for the get-chat cache. Mutates and returns the given response.
export const normalizeChatResponse = (response: ChatResponse): ChatResponse => {
  for (const message of Object.values(response.chat.history.messages)) {
    if (message.role === Role.ASSISTANT) {
      message.done = true;

      // NOTE: Backends on Open WebUI 0.11.0+ may return assistant text only in the `output`
      // array. Derive `content` from it when absent so both old and new formats render.
      if (!message.content) {
        message.content = getOutputText(message.output);
      }
    }
  }

  return response;
};
