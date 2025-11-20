import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ReactElement, useRef } from 'react';
import { FilterItem } from '@open-web-ui-mobile-client-react-native/mobile/chat/data-access/archived-chats-filter-state';
import {
  ActionsBottomSheet,
  ActionSheetItemProps,
  AppPressable,
  AppText,
  Icon,
  View,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';

interface ArchivedChatsFiltersSheetProps {
  filters: Array<FilterItem>;
  selectedFilter: FilterItem;
  onFilterPress: (filter: FilterItem) => void;
}

export function ArchivedChatsFiltersSheet({
  filters,
  selectedFilter,
  onFilterPress,
}: ArchivedChatsFiltersSheetProps): ReactElement {
  const actionsBottomSheetRef = useRef<BottomSheetModal>(null);

  const handleFilterPress = (filter: FilterItem): void => {
    actionsBottomSheetRef.current?.close();
    onFilterPress(filter);
  };

  const availableFilters: Array<ActionSheetItemProps> = filters.map(
    (filter: FilterItem): ActionSheetItemProps => ({
      title: filter.title,
      onPress: () => handleFilterPress(filter),
      iconName: 'tick',
      iconProps: {
        className: selectedFilter.title === filter.title ? 'color-text-primary' : 'color-transparent',
      },
    }),
  );

  const renderTrigger = ({ onPress }: { onPress: () => void }): ReactElement => (
    <View className='w-full items-center py-12'>
      <AppPressable
        className='flex-row items-center bg-background-secondary py-6 px-12 rounded-6xl gap-4'
        onPress={onPress}>
        <AppText className='text-sm-sm sm:text-sm'>{selectedFilter.title}</AppText>
        <Icon name='chevronDown' className='color-text-secondary' />
      </AppPressable>
    </View>
  );

  return <ActionsBottomSheet
    ref={actionsBottomSheetRef}
    renderTrigger={renderTrigger}
    actions={availableFilters} />;
}
