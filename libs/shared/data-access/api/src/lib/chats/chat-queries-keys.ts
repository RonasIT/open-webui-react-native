import { createQueriesKeys } from '@open-webui-react-native/shared/data-access/base-entity';
import { ChatResponse } from './models';

export const chatQueriesKeys = createQueriesKeys<ChatResponse>('chat');
