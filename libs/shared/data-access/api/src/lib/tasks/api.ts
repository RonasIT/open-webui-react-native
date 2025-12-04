import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiErrorData } from '@open-webui-react-native/shared/data-access/api-client';
import { Chat, patchChatQueryData } from '../chats';
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
      patchChatQueryData(chatId, {
        chat: {
          history: {
            messages: {
              [lastMessageId]: {
                done: true,
              },
            },
          },
        } as Chat,
      });
    },

    ...props,
  });
}

export const tasksApi = {
  useStopTask,
};
