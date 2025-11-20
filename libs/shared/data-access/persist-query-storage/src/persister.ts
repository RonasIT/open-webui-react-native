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
      const json = JSON.stringify(persistedClient);
      persistStorage.set(mmkvStorageID, json);
    },
    restoreClient: async (): Promise<PersistedClient | undefined> => {
      const raw = persistStorage.getString(mmkvStorageID);
      if (!raw) return undefined;
      const parsed = JSON.parse(raw) as PersistedClient;

      return parsed;
    },
    removeClient: async () => {
      persistStorage.delete(mmkvStorageID);
    },
  } satisfies Persister;
}

export const queryPersister = createQueryPersister();
