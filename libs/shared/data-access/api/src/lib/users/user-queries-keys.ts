import { createQueriesKeys } from '@open-webui-react-native/shared/data-access/base-entity';
import { User } from './models';

export const userQueriesKeys = createQueriesKeys<User>('user');
