import { partialMatchKey, QueryKey } from '@tanstack/react-query';
import { createQueriesKeys } from '@open-webui-react-native/shared/data-access/base-entity';
import { ChatResponse } from './models';

export const chatQueriesKeys = createQueriesKeys<ChatResponse>('chat');

// NOTE: A chat saved before this query opted out of persistence is restored with the old meta, so the get-by-id key is what drops it.
export const isChatByIdQuery = (queryKey: QueryKey): boolean => partialMatchKey(queryKey, chatQueriesKeys.get._def);
