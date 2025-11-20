import { createQueriesKeys } from '@open-web-ui-mobile-client-react-native/shared/data-access/base-entity';
import { ChatResponse } from './models';

export const chatQueriesKeys = createQueriesKeys<ChatResponse>('chat');
