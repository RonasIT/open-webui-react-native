import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiErrorData } from '@open-webui-react-native/shared/data-access/api-client';
import { StopTaskResponse } from './models';
import { tasksService } from './service';

function useStopTask(
  props?: UseMutationOptions<StopTaskResponse, AxiosError<ApiErrorData>, string>,
): UseMutationResult<StopTaskResponse, AxiosError<ApiErrorData>, string> {
  return useMutation({
    mutationFn: (taskId: string) => tasksService.stopTask(taskId),
    ...props,
  });
}

export const tasksApi = {
  useStopTask,
};
