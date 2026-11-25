import { createQueriesKeys } from '@open-webui-react-native/shared/data-access/base-entity';
import { ChatResponse } from './models';

export const chatQueriesKeys = createQueriesKeys<ChatResponse>('chat');

// NOTE: The id is unused. It only reads the ['chat', 'get'] prefix from the factory.
const chatGetQueryKey = chatQueriesKeys.get('chat-id').queryKey;

// NOTE: A chat saved before this query opted out of persistence is restored with the old meta, so the key is what drops it.
export const isChatBodyQueryKey = (queryKey: ReadonlyArray<unknown>): boolean =>
  queryKey[0] === chatGetQueryKey[0] && queryKey[1] === chatGetQueryKey[1];
