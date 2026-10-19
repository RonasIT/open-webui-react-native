import { useMutation, UseMutationOptions, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiErrorData } from '@open-webui-react-native/shared/data-access/api-client';
import { SignInResponse } from '../auth/models';
import { mfaApiConfig } from './config';
import {
  ConfirmMfaEnrollmentRequest,
  MfaChallenge,
  RecoverMfaRequest,
  StartMfaEnrollmentResponse,
  VerifyMfaRequest,
} from './models';
import { mfaService } from './service';

function useStartEnrollment(
  challengeToken?: string,
  onError?: (error: unknown) => void,
): UseQueryResult<StartMfaEnrollmentResponse, AxiosError> {
  return useQuery<StartMfaEnrollmentResponse, AxiosError>({
    queryFn: async () => {
      try {
        return await mfaService.startEnrollment(challengeToken ?? '');
      } catch (error) {
        onError?.(error);
        throw error;
      }
    },
    queryKey: mfaApiConfig.startEnrollmentQueryKey(challengeToken ?? ''),
    enabled: Boolean(challengeToken),
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    meta: { persist: false },
  });
}

function useConfirmEnrollment(
  props?: UseMutationOptions<SignInResponse, AxiosError<ApiErrorData>, ConfirmMfaEnrollmentRequest>,
): UseMutationResult<SignInResponse, AxiosError<ApiErrorData>, ConfirmMfaEnrollmentRequest> {
  return useMutation<SignInResponse, AxiosError<ApiErrorData>, ConfirmMfaEnrollmentRequest>({
    mutationFn: mfaService.confirmEnrollment,
    ...props,
  });
}

function useVerify(
  props?: UseMutationOptions<SignInResponse, AxiosError<ApiErrorData>, VerifyMfaRequest>,
): UseMutationResult<SignInResponse, AxiosError<ApiErrorData>, VerifyMfaRequest> {
  return useMutation<SignInResponse, AxiosError<ApiErrorData>, VerifyMfaRequest>({
    mutationFn: mfaService.verify,
    ...props,
  });
}

function useRecover(
  props?: UseMutationOptions<MfaChallenge, AxiosError<ApiErrorData>, RecoverMfaRequest>,
): UseMutationResult<MfaChallenge, AxiosError<ApiErrorData>, RecoverMfaRequest> {
  return useMutation<MfaChallenge, AxiosError<ApiErrorData>, RecoverMfaRequest>({
    mutationFn: mfaService.recover,
    ...props,
  });
}

export const mfaApi = {
  useStartEnrollment,
  useConfirmEnrollment,
  useVerify,
  useRecover,
};
