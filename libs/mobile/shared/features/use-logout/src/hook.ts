import { useQueryClient } from '@tanstack/react-query';
import { authService, resetChatSessionState } from '@open-webui-react-native/shared/data-access/api';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { cookieService } from '@open-webui-react-native/shared/data-access/cookie';
import { queryPersister } from '@open-webui-react-native/shared/data-access/persist-query-storage';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';

export const useLogout = (): { logout: () => Promise<void> } => {
  const queryClient = useQueryClient();

  const logout = async (): Promise<void> => {
    const token = appStorageService.token.get();

    // Not awaited: an unreachable server would block the logout until the system request timeout.
    // The result is irrelevant — the session may already be gone and the client state is wiped anyway.
    if (token) {
      authService.signOut(token).catch(() => undefined);
    }

    authState$.logout();
    queryClient.removeQueries();
    resetChatSessionState();
    cookieService.clearAll();
    await queryPersister.removeClient();
  };

  return { logout };
};
