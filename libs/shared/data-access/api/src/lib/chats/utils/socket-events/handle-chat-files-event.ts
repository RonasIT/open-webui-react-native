import { plainToInstance } from 'class-transformer';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { ChatEventBase, ChatFilesData } from '@open-webui-react-native/shared/data-access/websocket';
import { hapticFeedbackService } from '@open-webui-react-native/shared/utils/haptic-feedback-service';
import { chatQueriesKeys } from '../../chat-queries-keys';
import { ChatResponse, Message } from '../../models';
import { isTemporaryChatId } from '../temporary-chat-id';

export const handleChatFilesEvent = async (socketResponse: ChatEventBase): Promise<void> => {
  const { chatId, messageId } = socketResponse;
  const socketData = plainToInstance(ChatFilesData, socketResponse.data.data);

  const queryKey = chatQueriesKeys.get(chatId).queryKey;

  // NOTE: For saved chats the backend persists the files first and the event carries the full list,
  // so it replaces the message files. Temporary chats are not persisted and each event carries only
  // the new files, so they are appended (same as the Open WebUI web client).
  const getUpdatedFiles = (files: Message['files']): Message['files'] =>
    isTemporaryChatId(chatId) ? [...(files ?? []), ...(socketData.files ?? [])] : socketData.files;

  queryClient.setQueryData(queryKey, (draft: ChatResponse) => {
    if (!draft) return;

    if (!draft.chat.messages) {
      return draft;
    }

    const messageIndex = draft.chat.messages.findIndex((message) => message.id === messageId);

    return {
      ...draft,
      chat: {
        ...draft.chat,
        history: {
          ...draft.chat.history,
          messages: {
            ...draft.chat.history.messages,
            [messageId]: {
              ...draft.chat.history.messages[messageId],
              files: getUpdatedFiles(draft.chat.history.messages[messageId]?.files),
            },
          },
        },
        messages:
          messageIndex === -1
            ? draft.chat.messages
            : [
                ...draft.chat.messages.slice(0, messageIndex),
                {
                  ...draft.chat.messages[messageIndex],
                  files: getUpdatedFiles(draft.chat.messages[messageIndex].files),
                },
                ...draft.chat.messages.slice(messageIndex + 1),
              ],
      },
    };
  });

  if (socketData.files?.length) {
    await hapticFeedbackService.trigger();
  }
};
