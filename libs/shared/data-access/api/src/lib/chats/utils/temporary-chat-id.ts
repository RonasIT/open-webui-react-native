import uuid from 'react-native-uuid';

// NOTE: Prefix mirrors the Open WebUI web app's own `temporary:${socketId}` convention
// (src/lib/utils/chatId.ts) — a synthetic id used only for socket/streaming correlation,
// never round-tripped through a persisted chats-table row.
const TEMPORARY_CHAT_ID_PREFIX = 'temporary:';

export const createTemporaryChatId = (): string => `${TEMPORARY_CHAT_ID_PREFIX}${uuid.v4()}`;

export const isTemporaryChatId = (id?: string | null): boolean => !!id?.startsWith(TEMPORARY_CHAT_ID_PREFIX);
