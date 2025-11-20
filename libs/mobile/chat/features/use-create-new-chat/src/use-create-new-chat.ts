import dayjs from 'dayjs';
import {
  chatApi,
  ChatGenerationOption,
  patchChatList,
  prepareCompleteChatPayload,
  prepareCreateChatPayload,
} from '@open-web-ui-mobile-client-react-native/shared/data-access/api';
import { FileData, ImageData } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';
import { socketService } from '@open-web-ui-mobile-client-react-native/shared/data-access/websocket';

interface UseCreateNewChatArgs {
  onSuccess: (id: string) => void;
}

export function useCreateNewChat({ onSuccess }: UseCreateNewChatArgs): typeof result {
  const socketSessionId = socketService.socketSessionId;

  const { mutate: completeChat, isPending: isChatCompleting } = chatApi.useCompleteChat();

  const { mutate: createNewChat, isPending: isChatCreating } = chatApi.useCreateNewChat();

  const startChatCreation = (
    prompt: string,
    model: string,
    generationOptions?: Array<ChatGenerationOption>,
    attachedFiles?: Array<FileData>,
    attachedImages?: Array<ImageData>,
    folderId?: string,
  ): void => {
    const payload = prepareCreateChatPayload({ prompt, model, attachedFiles, attachedImages, folderId });

    createNewChat(payload, {
      onSuccess: (data) => {
        onSuccess?.(data.id);
        patchChatList({
          id: data.id,
          title: data.title,
          updatedAt: dayjs(),
          createdAt: data.createdAt,
          folderId: data.folderId,
        });

        const completePayload = prepareCompleteChatPayload({
          chatId: data.id,
          messageId: data.chat.history.currentId,
          messages: data.chat.messages,
          sessionId: socketSessionId,
          model,
          generationOptions,
        });

        completeChat(completePayload);
      },
    });
  };

  const result = {
    startChatCreation,
    isLoading: isChatCreating || isChatCompleting,
  };

  return result;
}
