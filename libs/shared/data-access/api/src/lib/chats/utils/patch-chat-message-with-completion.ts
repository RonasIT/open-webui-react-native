import { MessageSource, Role } from '@open-webui-react-native/shared/data-access/common';
import { ChatResponse, Message, History } from '../models';

export function patchChatMessagesWithCompletion(
  oldData: ChatResponse | undefined,
  newContent: string,
  sources?: Array<MessageSource>,
): ChatResponse | undefined {
  if (!oldData) return;

  const { chat } = oldData;
  const { messages, history } = chat;

  const lastMessage = messages[messages.length - 1];

  if (!lastMessage || lastMessage.role !== Role.ASSISTANT) {
    return oldData;
  }

  const updatedLastMessage: Message = {
    ...lastMessage,
    content: newContent,
    sources,
    socketStatusData: history.messages[lastMessage.id]?.socketStatusData,
  };

  const updatedMessages = messages.map((m) => (m.id === updatedLastMessage.id ? updatedLastMessage : m));

  const updatedHistoryMessages = {
    ...history.messages,
    [updatedLastMessage.id]: updatedLastMessage,
  };

  const updatedHistory = new History({
    messages: updatedHistoryMessages,
    currentId: history.currentId,
  });

  return {
    ...oldData,
    chat: {
      ...chat,
      messages: updatedMessages,
      history: updatedHistory,
    },
  };
}
