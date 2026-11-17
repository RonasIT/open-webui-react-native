import { isServerVersionAtLeast } from '../../app-configuration/utils/is-server-version-at-least';
import { isFeaturePermitted } from './is-feature-permitted';

// NOTE: Covers every `ui` field the Settings screen saves (Open WebUI `InterfaceSettings`).
export const isInterfaceSettingsPermitted = (): boolean => isFeaturePermitted('settings', 'interface', true);

// NOTE: Open WebUI 0.10.0–0.11.3 rejects the whole save without `settings.interface`; remove with 0.11.3 support.
export const isSystemPromptSettingPermitted = (): boolean =>
  isFeaturePermitted('chat', 'controls', true) &&
  isFeaturePermitted('chat', 'systemPrompt', true) &&
  (isInterfaceSettingsPermitted() || isServerVersionAtLeast('0.11.4'));
