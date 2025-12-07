import { Role } from '@open-webui-react-native/shared/data-access/common';
import { ChatResponse, Message } from '../models';

export function prepareCopyEditedMessagePayload(
  oldData: ChatResponse,
  messageId: string,
  newContent: string,
): ChatResponse {
  const history = oldData.chat.history;
  const messagesMap = { ...history.messages };

  const target = messagesMap[messageId];
  if (!target) return oldData;

  const isAIMessage = target.role === Role.ASSISTANT;

  const updatedMessage: Message = {
    ...target,
    content: newContent,
  };
  messagesMap[messageId] = updatedMessage;

  if (!isAIMessage) {
    const patchedMessagesList = oldData.chat.messages.map((msg) => (msg.id === messageId ? updatedMessage : msg));
    const lastAssistantMessage = oldData.chat.history.lastAssistantMessage;

    return {
      ...oldData,
      chat: {
        ...oldData.chat,
        history: {
          ...history,
          messages: messagesMap,
          lastAssistantMessage,
        },
        messages: patchedMessagesList,
      },
    };
  }

  const chain: Array<Message> = [];
  let pointer: Message | undefined = updatedMessage;

  while (pointer) {
    chain.unshift(pointer);
    pointer = pointer.parentId ? messagesMap[pointer.parentId] : undefined;
  }

  const newCurrentId = updatedMessage.id;

  return {
    ...oldData,
    chat: {
      ...oldData.chat,
      history: {
        ...history,
        messages: messagesMap,
        currentId: newCurrentId,
        lastAssistantMessage: updatedMessage,
      },
      messages: chain,
    },
  };
}
