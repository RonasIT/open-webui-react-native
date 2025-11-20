import { useMutation, UseMutationOptions, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiErrorData } from '@open-web-ui-mobile-client-react-native/shared/data-access/api-client';
import { authApiConfig } from './config';
import { GoogleSignInRequest, SignInRequest } from './models';
import { SignInResponse } from './models/sign-in-response';
import { authService } from './service';

function useSignInWithEmailPassword(
  props: UseMutationOptions<SignInResponse, AxiosError<ApiErrorData>, SignInRequest>,
): UseMutationResult<SignInResponse, AxiosError<ApiErrorData>, SignInRequest> {
  return useMutation<SignInResponse, AxiosError<ApiErrorData>, SignInRequest>({
    mutationFn: authService.signInWithEmailPassword,
    ...props,
  });
}

function useSignInWithGoogle(
  props: UseMutationOptions<SignInResponse, AxiosError<ApiErrorData>, GoogleSignInRequest>,
): UseMutationResult<SignInResponse, AxiosError<ApiErrorData>, GoogleSignInRequest> {
  return useMutation<SignInResponse, AxiosError<ApiErrorData>, GoogleSignInRequest>({
    mutationFn: authService.signInWithGoogle,
    ...props,
  });
}

function useSignOut(): UseMutationResult<void, AxiosError, void> {
  return useMutation<void, AxiosError, void>({
    mutationFn: authService.signOut,
  });
}

function useGetProfile(): UseQueryResult<SignInResponse, AxiosError> {
  return useQuery<SignInResponse, AxiosError>({
    queryFn: authService.getProfile,
    queryKey: authApiConfig.getProfileQueryKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export const authApi = {
  useSignInWithEmailPassword,
  useSignInWithGoogle,
  useGetProfile,
  useSignOut,
};
