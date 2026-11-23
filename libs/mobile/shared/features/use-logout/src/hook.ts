import { useQueryClient } from '@tanstack/react-query';
import {
  authService,
  resetChatSessionState,
  resetUnavailableModels,
} from '@open-webui-react-native/shared/data-access/api';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { cookieService } from '@open-webui-react-native/shared/data-access/cookie';
import { localDbService } from '@open-webui-react-native/shared/data-access/local-db';
import { queryPersister } from '@open-webui-react-native/shared/data-access/persist-query-storage';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';

interface LogoutOptions {
  // NOTE: Only a sign-out the person chooses drops the Access pass; an expired session keeps it.
  shouldClearAccessPass?: boolean;
}

export const useLogout = (): { logout: (options?: LogoutOptions) => Promise<void> } => {
  const queryClient = useQueryClient();

  const logout = async ({ shouldClearAccessPass }: LogoutOptions = {}): Promise<void> => {
    const token = appStorageService.token.get();

    // Not awaited: an unreachable server would block the logout until the system request timeout.
    // The result is irrelevant — the session may already be gone and the client state is wiped anyway.
    if (token) {
      authService.signOut().catch(() => undefined);
    }

    authState$.logout();

    if (shouldClearAccessPass) {
      authState$.clearAccessPass();
    }

    queryClient.removeQueries();
    resetChatSessionState();
    resetUnavailableModels();
    cookieService.clearAll();
    await queryPersister.removeClient();
    await localDbService.clear();
  };

  return { logout };
};
