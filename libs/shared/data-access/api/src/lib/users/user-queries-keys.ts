import { createQueriesKeys } from '@open-web-ui-mobile-client-react-native/shared/data-access/base-entity';
import { User } from './models';

export const userQueriesKeys = createQueriesKeys<User>('user');
