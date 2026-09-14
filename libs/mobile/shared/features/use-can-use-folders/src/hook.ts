import { appConfigurationApi, authApi } from '@open-webui-react-native/shared/data-access/api';
import { UserRole } from '@open-webui-react-native/shared/data-access/common';

export interface UseCanUseFoldersResult {
  canUseFolders: boolean;
  isLoading: boolean;
}

export function useCanUseFolders(): UseCanUseFoldersResult {
  const { data: config, isLoading: isConfigLoading } = appConfigurationApi.useGetAppConfiguration();
  const { data: profile, isLoading: isProfileLoading } = authApi.useGetProfile();

  // NOTE: matches the web app's gate (Sidebar.svelte) and the backend's check_folders_permission,
  // which guards every folders route (read and write alike) — the instance-wide toggle must be on,
  // and a non-admin additionally needs the per-user permission, defaulting to allowed when unset.
  const canUseFolders = Boolean(
    config?.features.enableFolders &&
    (profile?.role === UserRole.ADMIN || (profile?.permissions.features.folders ?? true)),
  );

  return { canUseFolders, isLoading: isConfigLoading || isProfileLoading };
}
