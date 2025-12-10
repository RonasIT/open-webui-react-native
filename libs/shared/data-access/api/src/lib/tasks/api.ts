import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiErrorData } from '@open-webui-react-native/shared/data-access/api-client';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { chatQueriesKeys } from '../chats/chat-queries-keys';
import { ChatResponse, History } from '../chats/models';
import { StopTaskResponse } from './models';
import { tasksService } from './service';

type StopTaskArgs = {
  taskId: string;
  chatId: string;
  lastMessageId: string;
};

function useStopTask(
  props?: UseMutationOptions<StopTaskResponse, AxiosError<ApiErrorData>, StopTaskArgs>,
): UseMutationResult<StopTaskResponse, AxiosError<ApiErrorData>, StopTaskArgs> {
  return useMutation({
    mutationFn: ({ taskId }) => tasksService.stopTask(taskId),

    onSuccess: (_, { chatId, lastMessageId }) => {
      queryClient.setQueryData<ChatResponse>(chatQueriesKeys.get(chatId).queryKey, (chat) => {
        if (!chat) return chat;

        const history = chat.chat.history;
        const message = history.messages[lastMessageId];

        if (!message) return chat;

        // already stopped / completed
        if (message.done === true) {
          return chat;
        }

        const updatedMessage = {
          ...message,
          done: true,
        };

        return {
          ...chat,
          chat: {
            ...chat.chat,
            messages: chat.chat.messages.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)),
            history: new History({
              messages: {
                ...history.messages,
                [updatedMessage.id]: updatedMessage,
              },
              currentId: history.currentId,
            }),
          },
        };
      });
    },

    ...props,
  });
}

export const tasksApi = {
  useStopTask,
};
