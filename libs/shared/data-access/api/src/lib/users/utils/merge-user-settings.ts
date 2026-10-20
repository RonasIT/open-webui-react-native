import { UserSettings } from '../models';
import { UiSettings } from '../models/ui-settings';

// NOTE: Mirrors the backend: `ui` is patched field by field, the other fields are replaced.
export function mergeUserSettings(current: UserSettings | null | undefined, patch: UserSettings): UserSettings {
  return new UserSettings({ ...current, ...patch, ui: new UiSettings({ ...current?.ui, ...patch.ui }) });
}
