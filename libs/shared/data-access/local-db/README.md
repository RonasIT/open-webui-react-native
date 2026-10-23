# shared-data-access-local-db

Local SQLite database (expo-sqlite) for the offline mode: chat list, full chat contents, folders and the profile.
Use it through `localDbService`.

- Methods accept and return plain server JSON (snake_case keys, unix-second timestamps), not class-transformer
  instances: `instanceToPlain` does not round-trip the Dayjs fields of the API models.
- The database opens lazily on the first call, once per JS runtime. All operations run one by one on a single
  connection.
- Schema changes: append a migration to `src/migrations.ts`; never edit a shipped one. Migration v1 was edited in
  place before the first release; from the first release on, only append.
- If the database cannot be opened or migrated, it is deleted and recreated. If that fails too, the database is
  disabled for the runtime: reads resolve empty, writes do nothing, the error goes to Sentry.
- `localDbService.clear()` wipes all tables on logout. Every write requires a generation: take
  `localDbService.getGeneration()` before the server request and pass it to the write. A write with an outdated
  generation (a logout happened in between) is dropped, so the previous account's data never reaches the wiped
  database.
- `getChat()` returns the stored content with the current title, folder and pin from the chat list. Its `updated_at`
  is the version of the stored content; the content is stale when it is older than `updated_at` from `getChats()`
  (`content_updated_at` there is the same content version).
- If the wipe fails, or the database was not opened in this runtime, a persistent flag makes the next open delete the
  database files and wipe the tables before any other operation. A failed wipe also disables the database until then.
