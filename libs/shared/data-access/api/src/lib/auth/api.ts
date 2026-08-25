import { useMutation, UseMutationOptions, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiErrorData } from '@open-webui-react-native/shared/data-access/api-client';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { authApiConfig } from './config';
import { SignInRequest, UpdatePasswordRequest, UpdateProfileRequest } from './models';
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

function useUpdateProfile(
  props?: UseMutationOptions<UpdateProfileRequest, AxiosError<ApiErrorData>, UpdateProfileRequest>,
): UseMutationResult<UpdateProfileRequest, AxiosError<ApiErrorData>, UpdateProfileRequest> {
  return useMutation<UpdateProfileRequest, AxiosError<ApiErrorData>, UpdateProfileRequest>({
    mutationFn: authService.updateProfile,
    onSuccess: (request) => {
      queryClient.setQueryData<SignInResponse>(authApiConfig.getProfileQueryKey, (profile) =>
        profile
          ? new SignInResponse({ ...profile, name: request.name, profileImageUrl: request.profileImageUrl })
          : profile,
      );
    },
    ...props,
  });
}

function useUpdatePassword(
  props?: UseMutationOptions<void, AxiosError<ApiErrorData>, UpdatePasswordRequest>,
): UseMutationResult<void, AxiosError<ApiErrorData>, UpdatePasswordRequest> {
  return useMutation<void, AxiosError<ApiErrorData>, UpdatePasswordRequest>({
    mutationFn: authService.updatePassword,
    ...props,
  });
}

export const authApi = {
  useSignInWithEmailPassword,
  useGetProfile,
  useUpdateProfile,
  useUpdatePassword,
  useSignOut,
};
