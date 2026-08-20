import { usersApi } from '@open-webui-react-native/shared/data-access/api';

export function useDefaultSystemPrompt(): string | undefined {
  const { data: settings } = usersApi.useGetUserSettings();

  return settings?.ui.system?.trim() || undefined;
}
