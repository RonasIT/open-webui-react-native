import uuid from 'react-native-uuid';

// NOTE: Prefix mirrors the Open WebUI web app's own `temporary:${socketId}` convention
// (src/lib/utils/chatId.ts) — a synthetic id used only for socket/streaming correlation,
// never round-tripped through a persisted chats-table row.
const TEMPORARY_CHAT_ID_PREFIX = 'temporary:';

// NOTE: The suffix must be the socket session id: a temporary chat has no chats-table row, so
// `/tasks/chat/{id}/stop` proves ownership by resolving that suffix against the live socket pool.
// Any other suffix makes the backend answer 404 and generation cannot be stopped server-side.
// Falling back to a uuid keeps the chat usable while the socket is down — there is no streaming
// to stop in that state anyway.
export const createTemporaryChatId = (sessionId?: string): string =>
  `${TEMPORARY_CHAT_ID_PREFIX}${sessionId || uuid.v4()}`;

export const isTemporaryChatId = (id?: string | null): boolean => !!id?.startsWith(TEMPORARY_CHAT_ID_PREFIX);
