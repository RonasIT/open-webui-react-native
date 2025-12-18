import uuid from 'react-native-uuid';
import { Role } from '@open-webui-react-native/shared/data-access/common';
import { ChatResponse, History, Message } from '../models';
import { createMessagesList } from './create-messages-list';

export function prepareCopyEditedMessagePayload(
  oldData: ChatResponse,
  messageId: string,
  newContent: string,
): ChatResponse {
  const history = oldData.chat.history;
  const messagesMap = { ...history.messages };

  const original = messagesMap[messageId];
  if (!original || original.role !== Role.ASSISTANT) return oldData;

  const newAssistantMessageId = uuid.v4();

  const parentId = original.parentId ?? original.id;

  const newAssistantMessage: Message = {
    ...original,
    id: newAssistantMessageId,
    parentId,
    childrenIds: [],
    content: newContent,
    done: true,
  };

  if (parentId && messagesMap[parentId]) {
    const parent = messagesMap[parentId];
    messagesMap[parentId] = {
      ...parent,
      childrenIds: [...(parent.childrenIds ?? []), newAssistantMessageId],
    };
  }

  messagesMap[newAssistantMessageId] = newAssistantMessage;

  const updatedHistory: History = {
    ...history,
    currentId: newAssistantMessageId,
    messages: messagesMap,
    lastAssistantMessage: newAssistantMessage,
  };

  return {
    ...oldData,
    chat: {
      ...oldData.chat,
      history: updatedHistory,
      messages: createMessagesList(updatedHistory, newAssistantMessageId),
    },
  };
}
