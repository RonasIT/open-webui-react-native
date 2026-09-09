import dayjs from 'dayjs';
import {
  Chat,
  chatApi,
  ChatGenerationOption,
  chatQueriesKeys,
  ChatResponse,
  createTemporaryChatId,
  NEW_CHAT_TOOLS_SELECTION_KEY,
  patchChatList,
  prepareCompleteChatPayload,
  prepareCreateChatPayload,
  toolsSelectionState$,
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

    // NOTE: The tools were picked on the create-chat screen, before a chat id existed, so the
    // selection is parked under a placeholder key. Move it onto the real id — otherwise the chat
    // screen shows no tools selected and every later message in the chat silently drops them.
    const adoptToolsSelection = (chatId: string): void => {
      const pendingSelection = toolsSelectionState$[NEW_CHAT_TOOLS_SELECTION_KEY].peek();

      if (pendingSelection) {
        toolsSelectionState$[chatId].set(pendingSelection);
        toolsSelectionState$[NEW_CHAT_TOOLS_SELECTION_KEY].delete();
      }
    };

    // NOTE: Temporary chats are never persisted (no POST /chats/new, no chat-list entry) — they only
    // exist client-side for this session
    if (userSettings?.ui.temporaryChatByDefault) {
      const id = createTemporaryChatId(socketSessionId);
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
      adoptToolsSelection(id);
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

        adoptToolsSelection(data.id);
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
