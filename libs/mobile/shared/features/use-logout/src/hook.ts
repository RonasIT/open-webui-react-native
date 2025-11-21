import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '@open-webui-react-native/shared/data-access/api';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { cookieService } from '@open-webui-react-native/shared/data-access/cookie';

export const useLogout = (): { logout: () => Promise<void>; isLoading: boolean } => {
  const queryClient = useQueryClient();
  const { mutateAsync: signOut, isPending } = authApi.useSignOut();

  const logout = async (): Promise<void> => {
    await signOut();
    authState$.logout();
    queryClient.removeQueries();
    cookieService.clearAll();
  };

  return { logout, isLoading: isPending };
};
