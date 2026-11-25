import { Persister, PersistedClient } from '@tanstack/react-query-persist-client';
import { persistStorageConfig } from './config';
import { persistStorage } from './storage';

// TODO: Needs to resolve
// https://app.clickup.com/t/24336023/PRD-1631?comment=90150161034188 and
// https://app.clickup.com/t/24336023/PRD-1631?comment=90150161124908 before using
function createQueryPersister(): Persister {
  const { mmkvStorageID } = persistStorageConfig;

  return {
    persistClient: async (persistedClient: PersistedClient) => {
      persistStorage.set(mmkvStorageID, JSON.stringify(persistedClient));
      // NOTE: set() keeps the old file size. trim() shrinks it once chat bodies are left out of the next save.
      persistStorage.trim();
    },
    restoreClient: async (): Promise<PersistedClient | undefined> => {
      const raw = persistStorage.getString(mmkvStorageID);

      if (!raw) {
        return undefined;
      }

      return JSON.parse(raw) as PersistedClient;
    },
    removeClient: async () => {
      persistStorage.delete(mmkvStorageID);
      persistStorage.trim();
    },
  } satisfies Persister;
}

export const queryPersister = createQueryPersister();
