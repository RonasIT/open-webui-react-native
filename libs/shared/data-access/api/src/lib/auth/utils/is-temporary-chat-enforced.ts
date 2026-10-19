import { UserRole } from '@open-webui-react-native/shared/data-access/common';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { authApiConfig } from '../config';
import { SignInResponse } from '../models/sign-in-response';

export function isTemporaryChatEnforced(): boolean {
  const profile = queryClient.getQueryData<SignInResponse>(authApiConfig.getProfileQueryKey);
  const chatPermissions = profile?.permissions?.chat;

  return profile?.role !== UserRole.ADMIN && !!chatPermissions?.temporary && !!chatPermissions?.temporaryEnforced;
}
