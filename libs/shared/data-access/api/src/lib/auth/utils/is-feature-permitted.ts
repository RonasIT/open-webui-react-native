import { UserRole } from '@open-webui-react-native/shared/data-access/common';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { authApiConfig } from '../config';
import { SignInResponse } from '../models/sign-in-response';

// NOTE: reads the profile straight from the query cache instead of subscribing via
// authApi.useGetProfile() — the profile is already kept warm by whichever screen loaded it,
// so this stays a plain permission check rather than another cache subscription per call site.
export function isFeaturePermitted(isPermitted: boolean | undefined, fallback: boolean): boolean {
  const profile = queryClient.getQueryData<SignInResponse>(authApiConfig.getProfileQueryKey);

  return profile?.role === UserRole.ADMIN || (isPermitted ?? fallback);
}
