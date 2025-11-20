import {
  ChatGenerationOption,
  ChatResponse,
  chatApi,
  patchChatQueryData,
  prepareCompleteChatPayload,
  prepareSendMessagePayload,
} from '@open-web-ui-mobile-client-react-native/shared/data-access/api';
import { FileData, ImageData } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';
import { socketService } from '@open-web-ui-mobile-client-react-native/shared/data-access/websocket';

interface UseSendMessageArgs {
  chatData?: ChatResponse;
}

export function useSendMessage({ chatData }: UseSendMessageArgs): typeof result {
  const socketSessionId = socketService.socketSessionId;

  const { mutate: completeChat, isPending: isChatCompleting } = chatApi.useCompleteChat();

  const { mutate: updateChat, isPending: isChatUpdating } = chatApi.useUpdate({
    onMutate: (data) => {
      patchChatQueryData(data.id, data);
    },
  });

  const sendMessage = (
    prompt: string,
    model: string,
    generationOptions?: Array<ChatGenerationOption>,
    attachedFiles?: Array<FileData>,
    attachedImages?: Array<ImageData>,
  ): void => {
    if (!chatData) {
      return;
    }

    const payload = prepareSendMessagePayload({ prompt, chatData, model, attachedFiles, attachedImages });

    updateChat(payload, {
      onSuccess: (data) => {
        const completePayload = prepareCompleteChatPayload({
          chatId: data.id,
          messageId: data.chat!.history.currentId,
          messages: data.chat!.messages,
          sessionId: socketSessionId,
          model,
          generationOptions,
        });

        completeChat(completePayload);
      },
    });
  };

  const result = {
    sendMessage,
    isLoading: isChatCompleting || isChatUpdating,
  };

  return result;
}
