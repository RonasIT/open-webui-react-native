import * as Sentry from '@sentry/react-native';
import { deleteDatabaseAsync, openDatabaseAsync, SQLiteDatabase, SQLiteOpenOptions } from 'expo-sqlite';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { localDbMigrations } from './migrations';

const databaseName = 'local-db.db';

// NOTE: One connection, all operations queued: expo-sqlite breaks on reopen, close mid-query, parallel writes.
// ponytail: reads wait behind writes; split into a read connection if a large write ever blocks a screen.
let databasePromise: Promise<SQLiteDatabase | null> | undefined;
let queue: Promise<unknown> = Promise.resolve();
// NOTE: Bumped by clear; a write with an older generation (requested before logout) is dropped.
let generation = 0;

const captureLocalDbError = (error: unknown, operation: string): void => {
  Sentry.withScope((scope) => {
    scope.setTag('local-db.operation', operation);
    Sentry.captureException(error);
  });
};

const wipe = (db: SQLiteDatabase): Promise<void> =>
  db.withTransactionAsync(() =>
    db.execAsync('DELETE FROM chat_contents; DELETE FROM chats; DELETE FROM folders; DELETE FROM profile;'),
  );

const migrate = async (db: SQLiteDatabase): Promise<void> => {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  if (currentVersion > localDbMigrations.length) {
    throw new Error(`Local DB schema version ${currentVersion} is newer than ${localDbMigrations.length}`);
  }

  for (let version = currentVersion + 1; version <= localDbMigrations.length; version++) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(localDbMigrations[version - 1]);
      await db.execAsync(`PRAGMA user_version = ${version}`);
    });
  }
};

const openAndMigrate = async (options?: SQLiteOpenOptions): Promise<SQLiteDatabase> => {
  const db = await openDatabaseAsync(databaseName, options);

  try {
    await migrate(db);

    return db;
  } catch (error) {
    await db.closeAsync().catch(() => undefined);
    throw error;
  }
};

const deleteDatabaseFiles = async (): Promise<void> => {
  // NOTE: deleteDatabaseAsync leaves -wal/-shm, which could be replayed into the new file.
  for (const suffix of ['', '-wal', '-shm']) {
    await deleteDatabaseAsync(`${databaseName}${suffix}`).catch(() => undefined);
  }
};

const openOrRecreate = async (): Promise<SQLiteDatabase | null> => {
  try {
    return await openAndMigrate();
  } catch (error) {
    captureLocalDbError(error, 'open');
  }

  try {
    await deleteDatabaseFiles();

    // NOTE: Otherwise Android may return the cached broken handle (expo/expo#48999).
    return await openAndMigrate({ useNewConnection: true });
  } catch (error) {
    captureLocalDbError(error, 'recreate');

    return null;
  }
};

const openDatabase = async (): Promise<SQLiteDatabase | null> => {
  const isWipePending = Boolean(appStorageService.localDbWipePending.getBoolean());

  if (isWipePending) {
    await deleteDatabaseFiles();
  }

  const db = await openOrRecreate();

  if (!db || !isWipePending) {
    return db;
  }

  // NOTE: File deletion fails while the file is open, so the tables are wiped too.
  try {
    await wipe(db);
    appStorageService.localDbWipePending.remove();

    return db;
  } catch (error) {
    captureLocalDbError(error, 'pendingWipe');

    return null;
  }
};

const enqueue = <T>(operation: string, fallback: T, task: (db: SQLiteDatabase) => Promise<T>): Promise<T> => {
  databasePromise ??= openDatabase();

  const result = queue.then(async () => {
    // NOTE: Read at run time, so a failed clear also disables tasks queued before it.
    const db = await databasePromise;

    if (!db) {
      return fallback;
    }

    try {
      return await task(db);
    } catch (error) {
      captureLocalDbError(error, operation);

      return fallback;
    }
  });
  queue = result;

  return result;
};

export const getLocalDbGeneration = (): number => generation;

export const readLocalDb = enqueue;

export const writeLocalDb = (
  operation: string,
  task: (db: SQLiteDatabase) => Promise<void>,
  expectedGeneration: number,
): Promise<void> =>
  enqueue(operation, undefined, async (db) => {
    if (expectedGeneration !== generation) {
      return;
    }

    // NOTE: Not withExclusiveTransactionAsync: it opens a new connection without foreign_keys (no cascade).
    await db.withTransactionAsync(() => task(db));
  });

export const clearLocalDb = (): Promise<void> => {
  generation++;
  // NOTE: Removed only once the data is gone; while set, the next open deletes the files first.
  appStorageService.localDbWipePending.set(true);

  if (!databasePromise) {
    return Promise.resolve();
  }

  return enqueue('clear', undefined, async (db) => {
    try {
      await wipe(db);
      appStorageService.localDbWipePending.remove();
    } catch (error) {
      captureLocalDbError(error, 'clear');
      // NOTE: Set again: a concurrent first open may have removed it.
      appStorageService.localDbWipePending.set(true);
      databasePromise = Promise.resolve(null);
    }
  });
};
