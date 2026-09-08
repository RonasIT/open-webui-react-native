import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiErrorData } from '@open-webui-react-native/shared/data-access/api-client';
import { Chat, patchChatQueryData } from '../chats';
import { StopTaskResponse } from './models';
import { tasksService } from './service';

type StopChatTasksArgs = {
  chatId: string;
  lastMessageId: string;
};

function useStopChatTasks(
  props?: UseMutationOptions<StopTaskResponse, AxiosError<ApiErrorData>, StopChatTasksArgs>,
): UseMutationResult<StopTaskResponse, AxiosError<ApiErrorData>, StopChatTasksArgs> {
  return useMutation({
    mutationFn: ({ chatId }) => tasksService.stopChatTasks(chatId),

    // NOTE: Generation must stop in the UI even when the request fails, otherwise the loader
    // hangs with no way out. The web app does the same in `stopResponse()`.
    onSettled: (_data, _error, { chatId, lastMessageId }) => {
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
  useStopChatTasks,
};
