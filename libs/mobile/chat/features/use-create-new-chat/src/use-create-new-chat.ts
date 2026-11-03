import dayjs from 'dayjs';
import {
  Chat,
  chatApi,
  ChatGenerationOption,
  chatQueriesKeys,
  ChatResponse,
  chatSelectionState$,
  chatSystemPromptState$,
  createTemporaryChatId,
  isTemporaryChatEnforced,
  NEW_CHAT_SELECTION_KEY,
  NEW_CHAT_SYSTEM_PROMPT_KEY,
  patchChatList,
  prepareCompleteChatPayload,
  prepareCreateChatPayload,
  usersApi,
} from '@open-webui-react-native/shared/data-access/api';
import { AttachedListItem, ImageData } from '@open-webui-react-native/shared/data-access/common';
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
    attachedItems?: Array<AttachedListItem>,
    attachedImages?: Array<ImageData>,
    folderId?: string,
  ): void => {
    const payload = prepareCreateChatPayload({
      prompt,
      model,
      attachedItems,
      attachedImages,
      folderId,
      systemPrompt: chatSystemPromptState$[NEW_CHAT_SYSTEM_PROMPT_KEY].peek(),
    });

    // NOTE: The tools and generation options were picked on the create-chat screen, before a chat id
    // existed, so the selection is parked under a placeholder key. Move it onto the real id —
    // otherwise the chat screen falls back to the defaults and every later message in the chat
    // silently drops the user's choice.
    const adoptChatSelection = (chatId: string): void => {
      const pendingSelection = chatSelectionState$[NEW_CHAT_SELECTION_KEY].peek();

      if (pendingSelection) {
        chatSelectionState$[chatId].set(pendingSelection);
        chatSelectionState$[NEW_CHAT_SELECTION_KEY].delete();
      }
    };

    // NOTE: The system prompt (if any) is already baked into `payload.chat.params.system` above —
    // it only needs clearing here so a later chat created from this same screen doesn't inherit it.
    const clearPendingSystemPrompt = (): void => {
      if (chatSystemPromptState$[NEW_CHAT_SYSTEM_PROMPT_KEY].peek()) {
        chatSystemPromptState$[NEW_CHAT_SYSTEM_PROMPT_KEY].delete();
      }
    };

    // NOTE: Temporary chats are never persisted (no POST /chats/new, no chat-list entry) — they only
    // exist client-side for this session. When the server enforces them, POST /chats/new returns 403.
    if (isTemporaryChatEnforced() || userSettings?.ui.temporaryChatByDefault) {
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
      adoptChatSelection(id);
      clearPendingSystemPrompt();
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

        adoptChatSelection(data.id);
        clearPendingSystemPrompt();
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
