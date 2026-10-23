// NOTE: Append-only. Entry N upgrades the schema to version N + 1 (stored in PRAGMA user_version).
// Never edit a shipped entry — add a new one instead.
// All timestamps are unix seconds, as the server sends them. Server-shaped JSON lives in `data` columns.
export const localDbMigrations: Array<string> = [
  `
    CREATE TABLE chats (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT,
      folder_id TEXT,
      pinned INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER,
      updated_at INTEGER NOT NULL,
      content_updated_at INTEGER
    );
    CREATE INDEX chats_updated_at ON chats (updated_at);
    CREATE INDEX chats_folder_id ON chats (folder_id);

    CREATE TABLE chat_contents (
      chat_id TEXT PRIMARY KEY NOT NULL REFERENCES chats (id) ON DELETE CASCADE,
      data TEXT NOT NULL
    );

    CREATE TABLE folders (
      id TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL
    );

    CREATE TABLE profile (
      id TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL
    );
  `,
];
