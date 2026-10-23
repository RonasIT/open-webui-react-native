// NOTE: Append-only: entry N migrates to user_version N + 1, never edit a shipped entry.
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
