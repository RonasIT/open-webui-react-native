import * as Sentry from '@sentry/react-native';
import { deleteDatabaseAsync, openDatabaseAsync, SQLiteDatabase, SQLiteOpenOptions } from 'expo-sqlite';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { localDbMigrations } from './migrations';

const databaseName = 'local-db.db';

// NOTE: The database is opened once per JS runtime and every operation runs on that single connection through this
// queue. expo-sqlite crashes or poisons transactions when a database is reopened, closed mid-query or written
// concurrently (expo/expo#48999, #51903, #51393), so nothing here runs in parallel and nothing closes the connection
// after a successful open.
// ponytail: reads wait behind writes; split into a read connection if a large write ever blocks a screen.
// NOTE: Set on the first enqueued operation, so `undefined` also means the queue has never been used in this runtime.
let databasePromise: Promise<SQLiteDatabase | null> | undefined;
let queue: Promise<unknown> = Promise.resolve();
// NOTE: Bumped by clearLocalDb. A write carrying an older generation is dropped.
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

  // NOTE: A newer schema means the app was downgraded — its shape is unknown, so the database is recreated.
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
    // NOTE: Safe to close here: the queue waits for the open, so no query can be running on this connection yet.
    await db.closeAsync().catch(() => undefined);
    throw error;
  }
};

const deleteDatabaseFiles = async (): Promise<void> => {
  // NOTE: deleteDatabaseAsync removes only the main file. A leftover WAL could be replayed into the new database.
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

    // NOTE: A new connection: on Android a failed handle may stay cached and be returned again (expo/expo#48999).
    return await openAndMigrate({ useNewConnection: true });
  } catch (error) {
    captureLocalDbError(error, 'recreate');

    return null;
  }
};

// NOTE: Never rejects. If the database cannot be opened even after a recreation, it stays disabled for this runtime
// and every operation resolves with its fallback value.
const openDatabase = async (): Promise<SQLiteDatabase | null> => {
  // NOTE: Set when a logout could not wipe the data — it must not reach the next user.
  const isWipePending = Boolean(appStorageService.localDbWipePending.getBoolean());

  if (isWipePending) {
    await deleteDatabaseFiles();
  }

  const db = await openOrRecreate();

  if (!db || !isWipePending) {
    return db;
  }

  // NOTE: The file deletion may have failed (e.g. the file is still open), so the tables are wiped explicitly too.
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
    // NOTE: Read at execution time: a failed clear replaces it, and tasks queued before must not see the old data.
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

// NOTE: Pass the generation taken before the data was requested from the server: if a clear happened in between,
// the write is dropped instead of saving the previous account's data into the wiped database.
export const writeLocalDb = (
  operation: string,
  task: (db: SQLiteDatabase) => Promise<void>,
  expectedGeneration: number,
): Promise<void> =>
  enqueue(operation, undefined, async (db) => {
    if (expectedGeneration !== generation) {
      return;
    }

    await db.withTransactionAsync(() => task(db));
  });

export const clearLocalDb = (): Promise<void> => {
  generation++;
  // NOTE: Stays set until the data is actually gone, so a failed or skipped wipe is retried on the next open.
  appStorageService.localDbWipePending.set(true);

  // NOTE: Not opened in this runtime yet — the flag makes the next open delete the files, no need to open them now.
  if (!databasePromise) {
    return Promise.resolve();
  }

  return enqueue('clear', undefined, async (db) => {
    try {
      await wipe(db);
      appStorageService.localDbWipePending.remove();
    } catch (error) {
      captureLocalDbError(error, 'clear');
      // NOTE: Set again: a first open that was in flight during this clear may have finished its own pending wipe
      // and removed the flag. The data is still there — disable the database until the next launch wipes it.
      appStorageService.localDbWipePending.set(true);
      databasePromise = Promise.resolve(null);
    }
  });
};
