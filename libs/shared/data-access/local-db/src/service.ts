import { SQLiteBindValue } from 'expo-sqlite';
import { pick } from 'lodash-es';
import { clearLocalDb, getLocalDbGeneration, readLocalDb, writeLocalDb } from './database';
import { LocalChat, LocalChatListItem, LocalChatSummary, LocalFolder, LocalProfile, localProfileKeys } from './types';

class LocalDbService {
  public getGeneration(): number {
    return getLocalDbGeneration();
  }

  public clear(): Promise<void> {
    return clearLocalDb();
  }

  public upsertChatListItems(items: Array<LocalChatListItem>, generation: number): Promise<void> {
    return writeLocalDb(
      'upsertChatListItems',
      async (db) => {
        const statement = await db.prepareAsync(
          `INSERT INTO chats (id, title, folder_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)
          ON CONFLICT (id) DO UPDATE SET
            title = excluded.title,
            created_at = excluded.created_at,
            updated_at = excluded.updated_at,
            folder_id = CASE WHEN ? THEN excluded.folder_id ELSE chats.folder_id END
          WHERE excluded.updated_at >= chats.updated_at`,
        );

        try {
          for (const item of items) {
            await statement.executeAsync(
              item.id,
              item.title,
              item.folder_id ?? null,
              item.created_at,
              item.updated_at,
              item.folder_id !== undefined,
            );
          }
        } finally {
          await statement.finalizeAsync();
        }
      },
      generation,
    );
  }

  public setPinnedChatIds(ids: Array<string>, generation: number): Promise<void> {
    return writeLocalDb(
      'setPinnedChatIds',
      async (db) => {
        await db.runAsync('UPDATE chats SET pinned = id IN (SELECT value FROM json_each(?))', JSON.stringify(ids));
      },
      generation,
    );
  }

  public upsertChat(chat: LocalChat, generation: number): Promise<void> {
    return writeLocalDb(
      'upsertChat',
      async (db) => {
        // NOTE: Not INSERT OR REPLACE: it deletes the row and cascades to chat_contents.
        // NOTE: An older response (out of order) is skipped; updated_at keeps the newest version seen.
        const { changes } = await db.runAsync(
          `INSERT INTO chats (id, title, folder_id, pinned, created_at, updated_at, content_updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT (id) DO UPDATE SET
            title = excluded.title,
            folder_id = excluded.folder_id,
            pinned = excluded.pinned,
            created_at = excluded.created_at,
            updated_at = MAX(chats.updated_at, excluded.updated_at),
            content_updated_at = excluded.content_updated_at
          WHERE chats.content_updated_at IS NULL OR excluded.content_updated_at >= chats.content_updated_at`,
          chat.id,
          chat.title,
          chat.folder_id,
          chat.pinned ?? false,
          chat.created_at,
          chat.updated_at,
          chat.updated_at,
        );

        if (!changes) {
          return;
        }

        await db.runAsync(
          'INSERT INTO chat_contents (chat_id, data) VALUES (?, ?) ON CONFLICT (chat_id) DO UPDATE SET data = excluded.data',
          chat.id,
          JSON.stringify(chat),
        );
      },
      generation,
    );
  }

  public deleteChat(id: string, generation: number): Promise<void> {
    return writeLocalDb(
      'deleteChat',
      async (db) => {
        await db.runAsync('DELETE FROM chats WHERE id = ?', id);
      },
      generation,
    );
  }

  public getChats(filter: { folderId?: string; pinned?: boolean } = {}): Promise<Array<LocalChatSummary>> {
    return readLocalDb('getChats', [], async (db) => {
      const conditions: Array<string> = [];
      const params: Array<SQLiteBindValue> = [];

      if (filter.folderId !== undefined) {
        conditions.push('folder_id = ?');
        params.push(filter.folderId);
      }

      if (filter.pinned !== undefined) {
        conditions.push('pinned = ?');
        params.push(filter.pinned);
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const rows = await db.getAllAsync<Omit<LocalChatSummary, 'pinned'> & { pinned: number }>(
        `SELECT id, title, folder_id, pinned, created_at, updated_at, content_updated_at
        FROM chats ${where} ORDER BY updated_at DESC`,
        params,
      );

      return rows.map((row) => ({ ...row, pinned: Boolean(row.pinned) }));
    });
  }

  // NOTE: Row title/folder/pin win over the JSON; updated_at stays the content version for staleness checks.
  public getChat(id: string): Promise<LocalChat | null> {
    return readLocalDb('getChat', null, async (db) => {
      const row = await db.getFirstAsync<
        Pick<LocalChat, 'title' | 'folder_id'> & {
          pinned: number;
          data: string;
        }
      >(
        `SELECT chats.title, chats.folder_id, chats.pinned, chat_contents.data
        FROM chat_contents JOIN chats ON chats.id = chat_contents.chat_id
        WHERE chat_contents.chat_id = ?`,
        id,
      );

      if (!row) {
        return null;
      }

      const { data, ...columns } = row;

      return { ...(JSON.parse(data) as LocalChat), ...columns, pinned: Boolean(columns.pinned) };
    });
  }

  public replaceFolders(folders: Array<LocalFolder>, generation: number): Promise<void> {
    return writeLocalDb(
      'replaceFolders',
      async (db) => {
        await db.execAsync('DELETE FROM folders');

        for (const folder of folders) {
          await db.runAsync(
            'INSERT OR REPLACE INTO folders (id, data) VALUES (?, ?)',
            folder.id,
            JSON.stringify(folder),
          );
        }
      },
      generation,
    );
  }

  public getFolders(): Promise<Array<LocalFolder>> {
    return readLocalDb('getFolders', [], async (db) => {
      const rows = await db.getAllAsync<{ data: string }>('SELECT data FROM folders');

      return rows.map((row) => JSON.parse(row.data) as LocalFolder);
    });
  }

  // NOTE: Whitelisted keys: the sign-in response also carries the token.
  public saveProfile(profile: LocalProfile, generation: number): Promise<void> {
    return writeLocalDb(
      'saveProfile',
      async (db) => {
        await db.execAsync('DELETE FROM profile');
        await db.runAsync(
          'INSERT INTO profile (id, data) VALUES (?, ?)',
          profile.id,
          JSON.stringify(pick(profile, localProfileKeys)),
        );
      },
      generation,
    );
  }

  public getProfile(): Promise<LocalProfile | null> {
    return readLocalDb('getProfile', null, async (db) => {
      const row = await db.getFirstAsync<{ data: string }>('SELECT data FROM profile');

      return row ? (JSON.parse(row.data) as LocalProfile) : null;
    });
  }
}

export const localDbService = new LocalDbService();
