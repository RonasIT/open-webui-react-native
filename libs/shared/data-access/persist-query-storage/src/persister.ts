import { Persister, PersistedClient } from '@tanstack/react-query-persist-client';
import { persistStorageConfig } from './config';
import { persistStorage } from './storage';

// TODO: Needs to resolve
// https://app.clickup.com/t/24336023/PRD-1631?comment=90150161034188 and
// https://app.clickup.com/t/24336023/PRD-1631?comment=90150161124908 before using
function createQueryPersister(): Persister {
  const { mmkvStorageID } = persistStorageConfig;
  // NOTE: set() keeps the old file size. The first save of this launch already omits chat bodies, so one trim shrinks the file. A later save, including a streaming reply, does not.
  let hasTrimmed = false;

  return {
    persistClient: async (persistedClient: PersistedClient) => {
      persistStorage.set(mmkvStorageID, JSON.stringify(persistedClient));

      if (!hasTrimmed) {
        persistStorage.trim();
        hasTrimmed = true;
      }
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
