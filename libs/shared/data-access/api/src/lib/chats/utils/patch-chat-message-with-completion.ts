import { MessageSource, Role } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';
import { ChatResponse, Message } from '../models';

export function patchChatMessagesWithCompletion(
  oldData: ChatResponse | undefined,
  newContent: string,
  sources?: Array<MessageSource>,
): ChatResponse | undefined {
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
    content: newContent,
    sources: sources,
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
    ? {
        ...history,
        messages: updatedHistoryMessages,
      }
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
