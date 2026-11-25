export const persistStorageConfig = {
  mmkvStorageID: 'react-query-cache',
  maxAge: 1000 * 60 * 60 * 48,
  // NOTE: Streaming changes a chat query up to once per frame; each save writes the whole cache, so saves are batched
  saveThrottleMs: 1000,
};
