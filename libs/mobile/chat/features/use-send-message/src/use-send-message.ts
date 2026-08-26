import { EntityPartial } from '@ronas-it/rtkq-entity-api';
import { useCallback } from 'react';
import {
  ChatGenerationOption,
  ChatResponse,
  chatApi,
  isTemporaryChatId,
  patchChatQueryData,
  prepareCompleteChatPayload,
  prepareSendMessagePayload,
} from '@open-webui-react-native/shared/data-access/api';
import { FileData, ImageData } from '@open-webui-react-native/shared/data-access/common';
import { socketService } from '@open-webui-react-native/shared/data-access/websocket';

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

  const sendMessage = useCallback(
    (
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

      const triggerCompletion = (data: EntityPartial<ChatResponse>): void => {
        const completePayload = prepareCompleteChatPayload({
          chatId: data.id!,
          messageId: data.chat!.history.currentId,
          messages: data.chat!.messages,
          sessionId: socketSessionId,
          model,
          generationOptions,
        });

        completeChat(completePayload);
      };

      // NOTE: Temporary chats are never persisted (no POST /chats/{id}) — apply the same optimistic
      // cache patch `useUpdate`'s onMutate would have done, then trigger completion directly.
      if (isTemporaryChatId(payload.id)) {
        patchChatQueryData(payload.id!, payload);
        triggerCompletion(payload);

        return;
      }

      updateChat(payload, {
        onSuccess: triggerCompletion,
      });
    },
    [chatData, socketSessionId, updateChat, completeChat],
  );

  const result = {
    sendMessage,
    isLoading: isChatCompleting || isChatUpdating,
  };

  return result;
}
