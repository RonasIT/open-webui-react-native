import { Persister, PersistedClient } from '@tanstack/react-query-persist-client';
import { isChatByIdQuery } from '@open-webui-react-native/shared/data-access/api';
import { persistStorageConfig } from './config';
import { persistStorage } from './storage';

const cacheLengthKey = `${persistStorageConfig.mmkvStorageID}-length`;

// NOTE: Chat bodies live in the local database. A cache saved before that still holds them, and MMKV does not shrink the file on its own.
const withoutChatBodies = (client: PersistedClient): PersistedClient => {
  const queries = client.clientState.queries.filter((query) => !isChatByIdQuery(query.queryKey));

  if (queries.length === client.clientState.queries.length) {
    return client;
  }

  return { ...client, clientState: { ...client.clientState, queries } };
};

const writeClient = (client: PersistedClient): void => {
  const json = JSON.stringify(withoutChatBodies(client));
  const previousLength = persistStorage.getNumber(cacheLengthKey);

  persistStorage.set(persistStorageConfig.mmkvStorageID, json);
  persistStorage.set(cacheLengthKey, json.length);

  if (previousLength === undefined || json.length < previousLength) {
    persistStorage.trim();
  }
};

// TODO: Needs to resolve
// https://app.clickup.com/t/24336023/PRD-1631?comment=90150161034188 and
// https://app.clickup.com/t/24336023/PRD-1631?comment=90150161124908 before using
function createQueryPersister(): Persister {
  const { mmkvStorageID } = persistStorageConfig;

  return {
    persistClient: async (persistedClient: PersistedClient) => {
      writeClient(persistedClient);
    },
    restoreClient: async (): Promise<PersistedClient | undefined> => {
      const raw = persistStorage.getString(mmkvStorageID);

      if (!raw) {
        return undefined;
      }

      const parsed = JSON.parse(raw) as PersistedClient;
      const stored = withoutChatBodies(parsed);

      // NOTE: The file shrinks now. This launch still hydrates the old chat bodies, so a chat that is not in SQLite yet can open.
      if (stored !== parsed || persistStorage.getNumber(cacheLengthKey) === undefined) {
        writeClient(stored);
      }

      return parsed;
    },
    removeClient: async () => {
      persistStorage.delete(mmkvStorageID);
      persistStorage.delete(cacheLengthKey);
      persistStorage.trim();
    },
  } satisfies Persister;
}

export const queryPersister = createQueryPersister();
