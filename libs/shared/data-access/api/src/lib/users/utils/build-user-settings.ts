import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { usersApiConfig } from '../config';
import { UserSettings } from '../models';
import { UiSettings } from '../models/ui-settings';

export type UserSettingsPatch = Partial<Omit<UserSettings, 'ui'>> & { ui?: Partial<UiSettings> };

// NOTE: Applies the patch to the latest cached settings, so rapid changes never overwrite each other
// with a stale snapshot. `ui` is patched field by field; a user who never saved settings starts empty.
export function buildUserSettings(
  patch: UserSettingsPatch | ((current?: UserSettings) => UserSettingsPatch),
): UserSettings {
  const current = queryClient.getQueryData<UserSettings | null>(usersApiConfig.getUserSettingsQueryKey) ?? undefined;
  const { ui, ...rest } = typeof patch === 'function' ? patch(current) : patch;

  return new UserSettings({ ...current, ...rest, ui: new UiSettings({ ...current?.ui, ...ui }) });
}
