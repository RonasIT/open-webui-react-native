import * as Sentry from '@sentry/react-native';
import { Persister, PersistedClient } from '@tanstack/react-query-persist-client';
import { AppState } from 'react-native';
import { persistStorageConfig } from './config';
import { persistStorage } from './storage';

// TODO: Needs to resolve
// https://app.clickup.com/t/24336023/PRD-1631?comment=90150161034188 and
// https://app.clickup.com/t/24336023/PRD-1631?comment=90150161124908 before using
function createQueryPersister(): Persister {
  const { mmkvStorageID, saveThrottleMs } = persistStorageConfig;
  let pendingClient: PersistedClient | undefined;
  let saveTimer: ReturnType<typeof setTimeout> | undefined;
  let wasSaveFailureReported = false;

  // NOTE: A failed write (iOS under memory pressure) is skipped: the next cache change saves the whole cache again.
  // Reported once per launch, with the size, so a cache too large to write shows up without an event per attempt.
  const reportSaveFailure = (error: unknown, jsonLength?: number): void => {
    if (wasSaveFailureReported) {
      return;
    }

    wasSaveFailureReported = true;
    Sentry.withScope((scope) => {
      scope.setTag('persist-query-storage.operation', 'save');
      scope.setContext('persistedCache', { jsonLength });
      Sentry.captureException(error);
    });
  };

  const savePendingClient = (): void => {
    clearTimeout(saveTimer);
    saveTimer = undefined;

    if (!pendingClient) {
      return;
    }

    const client = pendingClient;
    pendingClient = undefined;
    let json: string | undefined;

    try {
      json = JSON.stringify(client);
      persistStorage.set(mmkvStorageID, json);
    } catch (error) {
      reportSaveFailure(error, json?.length);
    }
  };

  // NOTE: The app may be killed in the background before the timer fires, so the last change is saved right away
  AppState.addEventListener('change', (state) => {
    if (state !== 'active') {
      savePendingClient();
    }
  });

  return {
    persistClient: async (persistedClient: PersistedClient) => {
      pendingClient = persistedClient;
      saveTimer ??= setTimeout(savePendingClient, saveThrottleMs);
    },
    restoreClient: async (): Promise<PersistedClient | undefined> => {
      const raw = persistStorage.getString(mmkvStorageID);
      if (!raw) return undefined;
      const parsed = JSON.parse(raw) as PersistedClient;

      return parsed;
    },
    removeClient: async () => {
      // NOTE: A save scheduled before logout must not write the old cache back
      clearTimeout(saveTimer);
      saveTimer = undefined;
      pendingClient = undefined;
      persistStorage.delete(mmkvStorageID);
    },
  } satisfies Persister;
}

export const queryPersister = createQueryPersister();
