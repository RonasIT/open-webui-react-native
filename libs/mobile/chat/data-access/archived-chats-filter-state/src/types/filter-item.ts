import {
  ArchivedChatListOrderBy,
  ArchivedChatListOrderDirection,
} from '@open-webui-react-native/shared/data-access/api';

export type FilterItem = {
  title: string;
  orderBy: ArchivedChatListOrderBy;
  direction: ArchivedChatListOrderDirection;
};
