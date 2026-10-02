import { Permissions, UserRole } from '@open-webui-react-native/shared/data-access/common';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { authApiConfig } from '../config';
import { SignInResponse } from '../models/sign-in-response';

// NOTE: reads the profile straight from the query cache instead of subscribing via
// authApi.useGetProfile() — the main layout waits for the profile before rendering, so this stays
// a plain permission check rather than another cache subscription per call site. `fallback` applies
// when the backend omits the permission.
export function isFeaturePermitted<TGroup extends keyof Permissions>(
  group: TGroup,
  permission: keyof Permissions[TGroup],
  fallback: boolean,
): boolean {
  const profile = queryClient.getQueryData<SignInResponse>(authApiConfig.getProfileQueryKey);

  if (profile?.role === UserRole.ADMIN) {
    return true;
  }

  const isPermitted = profile?.permissions?.[group]?.[permission] as boolean | undefined;

  return isPermitted ?? fallback;
}
