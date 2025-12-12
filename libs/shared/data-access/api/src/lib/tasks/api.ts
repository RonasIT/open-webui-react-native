import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiErrorData } from '@open-webui-react-native/shared/data-access/api-client';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { chatQueriesKeys } from '../chats/chat-queries-keys';
import { ChatResponse } from '../chats/models';
import { findGeneratingAssistantMessageId, markAssistantMessageCompleted } from '../chats/utils';
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
        const generatingId = findGeneratingAssistantMessageId(history) ?? lastMessageId;
        if (!generatingId) return chat;

        return markAssistantMessageCompleted(chat, generatingId);
      });
    },

    ...props,
  });
}

export const tasksApi = {
  useStopTask,
};
