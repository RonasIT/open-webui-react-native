import { Role } from '@open-webui-react-native/shared/data-access/common';
import { ChatResponse } from '../models';

export function prepareEditAssistantMessagePayload(
  oldData: ChatResponse,
  messageId: string,
  newContent: string,
): ChatResponse {
  const history = oldData.chat.history;
  const messagesMap = { ...history.messages };

  const target = messagesMap[messageId];
  if (!target || target.role !== Role.ASSISTANT) return oldData;

  const updatedMessage = {
    ...target,
    content: newContent,
    done: true,
  };

  messagesMap[messageId] = updatedMessage;

  const updatedMessagesList = oldData.chat.messages.map((m) => (m.id === messageId ? updatedMessage : m));

  const lastAssistantMessage =
    history.lastAssistantMessage?.id === messageId ? updatedMessage : history.lastAssistantMessage;

  return {
    ...oldData,
    chat: {
      ...oldData.chat,
      history: {
        ...history,
        messages: messagesMap,
        lastAssistantMessage,
      },
      messages: updatedMessagesList,
    },
  };
}
