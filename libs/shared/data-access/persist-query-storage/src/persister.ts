import { Persister, PersistedClient } from '@tanstack/react-query-persist-client';
import { persistStorageConfig } from './config';
import { persistStorage } from './storage';

// TODO: Needs to resolve
// https://app.clickup.com/t/24336023/PRD-1631?comment=90150161034188 and
// https://app.clickup.com/t/24336023/PRD-1631?comment=90150161124908 before using
function createQueryPersister(): Persister {
  const { mmkvStorageID } = persistStorageConfig;
  const cacheLengthKey = `${mmkvStorageID}-length`;

  return {
    persistClient: async (persistedClient: PersistedClient) => {
      // NOTE: A second key makes every save append a new copy. MMKV then fills the file and doubles it. trim() cuts it to twice the live data, and the next save grows it again, so it is not called here.
      persistStorage.delete(cacheLengthKey);
      persistStorage.set(mmkvStorageID, JSON.stringify(persistedClient));
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
      persistStorage.delete(cacheLengthKey);
      persistStorage.trim();
    },
  } satisfies Persister;
}

export const queryPersister = createQueryPersister();
