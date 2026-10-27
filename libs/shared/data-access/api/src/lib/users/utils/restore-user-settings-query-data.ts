import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { usersApiConfig } from '../config';
import { UserSettings } from '../models';

// NOTE: Rolls back an optimistic update. A new user's `null` settings are restored too;
// settings that were never loaded are refetched.
export function restoreUserSettingsQueryData(previousSettings: UserSettings | null | undefined): void {
  if (previousSettings === undefined) {
    queryClient.resetQueries({ queryKey: usersApiConfig.getUserSettingsQueryKey });

    return;
  }

  queryClient.setQueryData<UserSettings | null>(usersApiConfig.getUserSettingsQueryKey, previousSettings);
}
