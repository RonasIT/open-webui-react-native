import { isUndefined, omitBy } from 'lodash-es';
import { UserSettings } from '../models';
import { UiSettings } from '../models/ui-settings';

// NOTE: Mirrors the backend: `ui` is patched field by field, the other fields are replaced.
export function mergeUserSettings(current: UserSettings | null | undefined, patch: UserSettings): UserSettings {
  return new UserSettings({
    ...current,
    ...omitBy(patch, isUndefined),
    ui: new UiSettings({ ...current?.ui, ...omitBy(patch.ui, isUndefined) }),
  });
}
