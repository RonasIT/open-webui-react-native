import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { useMemo } from 'react';
import {
  archivedChatsFilterState$,
  FilterItem,
} from '@open-web-ui-mobile-client-react-native/mobile/chat/data-access/archived-chats-filter-state';
import {
  ArchivedChatListOrderBy,
  ArchivedChatListOrderDirection,
} from '@open-web-ui-mobile-client-react-native/shared/data-access/api';

interface UseFiltersResult {
  filters: Array<FilterItem>;
  selectedFilter: FilterItem;
  handleFilterPress: (filter: FilterItem) => void;
  resetFilter: () => void;
}

export const useSearchFilters = (): UseFiltersResult => {
  const translate = useTranslation('CHAT.ARCHIVED_CHATS_FILTERS_SHEET.USE_SEARCH_FILTERS');

  const filters: Array<FilterItem> = useMemo(
    () => [
      {
        title: translate('TEXT_MOST_RECENT'),
        orderBy: ArchivedChatListOrderBy.UPDATED_AT,
        direction: ArchivedChatListOrderDirection.DESC,
      },
      {
        title: translate('TEXT_OLDEST'),
        orderBy: ArchivedChatListOrderBy.UPDATED_AT,
        direction: ArchivedChatListOrderDirection.ASC,
      },
      {
        title: translate('TEXT_A-Z'),
        orderBy: ArchivedChatListOrderBy.TITLE,
        direction: ArchivedChatListOrderDirection.ASC,
      },
      {
        title: translate('TEXT_Z-A'),
        orderBy: ArchivedChatListOrderBy.TITLE,
        direction: ArchivedChatListOrderDirection.DESC,
      },
    ],
    [],
  );

  const selectedFilter = useSelector(archivedChatsFilterState$.selectedFilter) || filters[0];

  const handleFilterPress = (filter: FilterItem): void => {
    archivedChatsFilterState$.selectedFilter.set(filter);
  };

  const resetFilter = (): void => archivedChatsFilterState$.selectedFilter.set(filters[0]);

  return {
    filters,
    selectedFilter,
    handleFilterPress,
    resetFilter,
  };
};
