import uuid from 'react-native-uuid';

// NOTE: Open WebUI 0.10.0–0.10.2 treats only `local:` as temporary; 0.11.0+ keeps it as the legacy
// prefix (utils/chat_id.py). A synthetic id for socket/streaming correlation, never a chats-table row.
const temporaryChatIdPrefix = 'local:';

// NOTE: The suffix must be the socket session id: a temporary chat has no chats-table row, so
// `/tasks/chat/{id}/stop` proves ownership by resolving that suffix against the live socket pool.
// Any other suffix makes the backend answer 404 and generation cannot be stopped server-side.
// Falling back to a uuid keeps the chat usable while the socket is down — there is no streaming
// to stop in that state anyway.
export const createTemporaryChatId = (sessionId?: string): string =>
  `${temporaryChatIdPrefix}${sessionId || uuid.v4()}`;

export const isTemporaryChatId = (id?: string | null): boolean => Boolean(id?.startsWith(temporaryChatIdPrefix));
