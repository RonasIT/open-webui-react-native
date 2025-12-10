import { Role } from '@open-webui-react-native/shared/data-access/common';
import { ChatResponse, Message, History } from '../models';

export function patchCompletedMessage(oldData: ChatResponse | undefined): ChatResponse | undefined {
  if (
    !oldData ||
    oldData.chat.messages.length === 0 ||
    oldData.chat.messages[oldData.chat.messages.length - 1].role !== Role.ASSISTANT
  ) {
    return oldData;
  }

  const { chat } = oldData;
  const { messages, history } = chat;

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== Role.ASSISTANT) return oldData;

  const updatedLastMessage: Message = {
    ...lastMessage,
    done: true,
    socketStatusData: history.messages[lastMessage.id]?.socketStatusData,
  };

  const updatedMessages = [...messages];
  updatedMessages[updatedMessages.length - 1] = updatedLastMessage;

  const updatedHistoryMessages = history?.messages
    ? {
        ...history.messages,
        [updatedLastMessage.id]: updatedLastMessage,
      }
    : undefined;

  const updatedHistory = updatedHistoryMessages
    ? new History({
        messages: updatedHistoryMessages,
        currentId: history.currentId,
      })
    : history;

  return {
    ...oldData,
    chat: {
      ...chat,
      messages: updatedMessages,
      history: updatedHistory,
    },
  };
}
