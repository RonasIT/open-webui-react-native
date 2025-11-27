import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiErrorData } from '@open-webui-react-native/shared/data-access/api-client';
import { audioApiConfig } from './config';
import { TranscriptionAudio } from './models';
import { audioService } from './service';

function useTranscribeAudio(
  props?: UseMutationOptions<TranscriptionAudio, AxiosError<ApiErrorData>, FormData>,
): UseMutationResult<TranscriptionAudio, AxiosError<ApiErrorData>, FormData> {
  return useMutation<TranscriptionAudio, AxiosError<ApiErrorData>, FormData>({
    mutationFn: audioService.transcribeAudio,
    mutationKey: audioApiConfig.transcribeAudioQueryKey,
    ...props,
  });
}

export const audioApi = {
  useTranscribeAudio,
};
