import dayjs from 'dayjs';
import {
  Chat,
  chatApi,
  ChatGenerationOption,
  chatQueriesKeys,
  ChatResponse,
  createTemporaryChatId,
  patchChatList,
  prepareCompleteChatPayload,
  prepareCreateChatPayload,
  usersApi,
} from '@open-webui-react-native/shared/data-access/api';
import { FileData, ImageData } from '@open-webui-react-native/shared/data-access/common';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { socketService } from '@open-webui-react-native/shared/data-access/websocket';

interface UseCreateNewChatArgs {
  onSuccess: (id: string) => void;
}

export function useCreateNewChat({ onSuccess }: UseCreateNewChatArgs): typeof result {
  const socketSessionId = socketService.socketSessionId;

  const { mutate: completeChat, isPending: isChatCompleting } = chatApi.useCompleteChat();

  const { mutate: createNewChat, isPending: isChatCreating } = chatApi.useCreateNewChat();

  const { data: userSettings } = usersApi.useGetUserSettings();

  const startChatCreation = (
    prompt: string,
    model: string,
    generationOptions?: Array<ChatGenerationOption>,
    attachedFiles?: Array<FileData>,
    attachedImages?: Array<ImageData>,
    folderId?: string,
  ): void => {
    const payload = prepareCreateChatPayload({ prompt, model, attachedFiles, attachedImages, folderId });

    // NOTE: Temporary chats are never persisted (no POST /chats/new, no chat-list entry) — they only
    // exist client-side for this session, matching the Open WebUI web app's "Temporary Chat" behavior.
    if (userSettings?.ui.temporaryChatByDefault) {
      const id = createTemporaryChatId();
      const chatResponse = new ChatResponse({
        id,
        title: payload.chat.title,
        chat: new Chat({ ...payload.chat, id }),
        createdAt: dayjs(),
        updatedAt: dayjs(),
        archived: false,
        pinned: false,
        meta: {},
      });

      queryClient.setQueryData<ChatResponse>(chatQueriesKeys.get(id).queryKey, chatResponse);
      onSuccess?.(id);

      completeChat(
        prepareCompleteChatPayload({
          chatId: id,
          messageId: chatResponse.chat.history.currentId,
          messages: chatResponse.chat.messages,
          sessionId: socketSessionId,
          model,
          generationOptions,
        }),
      );

      return;
    }

    createNewChat(payload, {
      onSuccess: (data) => {
        // NOTE: Seed get-chat cache so socket streaming and VoiceMode can track the assistant reply
        const assistantMessage = data.chat.history.messages[data.chat.history.currentId];

        if (assistantMessage) {
          assistantMessage.done = false;
        }

        queryClient.setQueryData<ChatResponse>(chatQueriesKeys.get(data.id).queryKey, data);

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
