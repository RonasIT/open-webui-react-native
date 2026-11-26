import { Persister, PersistedClient } from '@tanstack/react-query-persist-client';
import { persistStorageConfig } from './config';
import { persistStorage } from './storage';

// TODO: Needs to resolve
// https://app.clickup.com/t/24336023/PRD-1631?comment=90150161034188 and
// https://app.clickup.com/t/24336023/PRD-1631?comment=90150161124908 before using
function createQueryPersister(): Persister {
  const { mmkvStorageID } = persistStorageConfig;
  // NOTE: set() leaves the old file size. trim() shrinks it. A streaming reply is not in this JSON, so the same length does not trim again.
  let trimmedLength: number | undefined;

  return {
    persistClient: async (persistedClient: PersistedClient) => {
      const json = JSON.stringify(persistedClient);

      persistStorage.set(mmkvStorageID, json);

      if (trimmedLength === undefined || json.length > trimmedLength * 2 || json.length * 2 < trimmedLength) {
        persistStorage.trim();
        trimmedLength = json.length;
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
