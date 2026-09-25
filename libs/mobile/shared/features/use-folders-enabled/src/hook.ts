import { appConfigurationApi, authApi, isFeaturePermitted } from '@open-webui-react-native/shared/data-access/api';

export function useFoldersEnabled(): boolean {
  const { data: config } = appConfigurationApi.useGetAppConfiguration();
  const { data: profile } = authApi.useGetProfile();

  // NOTE: matches the web app's gate (Sidebar.svelte) and the backend's check_folders_permission,
  // which guards every folders route (read and write alike) — the instance-wide toggle must be on,
  // and a non-admin additionally needs the per-user permission, defaulting to allowed when unset.
  return Boolean(config?.features.enableFolders && isFeaturePermitted(profile?.permissions.features.folders, true));
}
