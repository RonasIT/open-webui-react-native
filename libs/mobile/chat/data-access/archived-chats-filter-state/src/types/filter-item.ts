import {
  ArchivedChatListOrderBy,
  ArchivedChatListOrderDirection,
} from '@open-web-ui-mobile-client-react-native/shared/data-access/api';

export type FilterItem = {
  title: string;
  orderBy: ArchivedChatListOrderBy;
  direction: ArchivedChatListOrderDirection;
};
