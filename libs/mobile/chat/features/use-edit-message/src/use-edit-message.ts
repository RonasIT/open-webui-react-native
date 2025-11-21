import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormValues } from '@open-webui-react-native/mobile/shared/utils/form';
import {
  chatApi,
  ChatResponse,
  prepareUpdateMessageInChatPayload,
  prepareCompleteChatPayload,
  prepareUpdateMessageToSendPayload,
} from '@open-webui-react-native/shared/data-access/api';
import { socketService } from '@open-webui-react-native/shared/data-access/websocket';

interface UseEditMessageProps {
  chat?: ChatResponse;
  modelId?: string;
}

export interface EditMessageSchema {
  editMessageInputValue: string;
}

export const useEditMessage = ({ chat, modelId }: UseEditMessageProps): typeof result => {
  const [editingMessageId, setEditingMessageId] = useState<string>();
  const socketSessionId = socketService.socketSessionId;

  const { control, handleSubmit, reset } = useForm<FormValues<EditMessageSchema>>({
    defaultValues: {
      editMessageInputValue: '',
    },
  });

  const { mutateAsync: updateChat, isPending: isChatUpdating } = chatApi.useUpdate();
  const { mutate: completeChat } = chatApi.useCompleteChat();

  const startEditing = (messageId: string, content: string): void => {
    setEditingMessageId(messageId);
    reset({ editMessageInputValue: content });
  };

  const cancelEditing = (): void => {
    setEditingMessageId(undefined);
    reset({ editMessageInputValue: '' });
  };

  const saveMessage = async (message: string): Promise<void> => {
    if (!chat?.chat || !editingMessageId) {
      return;
    }

    const preparedChat = prepareUpdateMessageInChatPayload(chat, editingMessageId, message);

    await updateChat(preparedChat);
    cancelEditing();
  };

  const sendEditedMessage = async (message: string): Promise<void> => {
    if (!chat?.chat || !editingMessageId || !modelId) {
      return;
    }
    const chatHistory = chat.chat.history;
    const editedMessage = chatHistory.messages[editingMessageId];

    const preparedChat = prepareUpdateMessageToSendPayload(chat, message, modelId, editedMessage.parentId);

    await updateChat(preparedChat, {
      onSuccess: (data) => {
        const completePayload = prepareCompleteChatPayload({
          chatId: data.id,
          messageId: data.chat!.history.currentId,
          messages: data.chat!.messages,
          sessionId: socketSessionId,
          model: modelId,
        });

        completeChat(completePayload);
      },
    });

    cancelEditing();
  };

  const result = {
    editingMessageId,
    control,
    handleSubmit,
    startEditing,
    cancelEditing,
    saveMessage,
    sendEditedMessage,
    isChatUpdating,
  };

  return result;
};
