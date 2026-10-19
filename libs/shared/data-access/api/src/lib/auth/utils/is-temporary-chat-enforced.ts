import { UserRole } from '@open-webui-react-native/shared/data-access/common';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { authApiConfig } from '../config';
import { SignInResponse } from '../models/sign-in-response';

// NOTE: mirrors the server rule (Open WebUI >= 0.12.0): a non-admin with both `chat.temporary` and
// `chat.temporary_enforced` gets 403 on creating/cloning a persisted chat. Unlike isFeaturePermitted,
// admins are exempt here, so it can't be expressed through that helper. Reads the cache the same way.
export function isTemporaryChatEnforced(): boolean {
  const profile = queryClient.getQueryData<SignInResponse>(authApiConfig.getProfileQueryKey);
  const chatPermissions = profile?.permissions?.chat;

  return profile?.role !== UserRole.ADMIN && !!chatPermissions?.temporary && !!chatPermissions?.temporaryEnforced;
}
