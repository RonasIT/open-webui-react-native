import { ReactElement } from 'react';
import { AppPressable, AppText, Icon } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ChatListItem } from '@open-webui-react-native/shared/data-access/api';
import { formatDateTime } from '@open-webui-react-native/shared/utils/date';

export interface ReferenceChatRowProps {
  item: ChatListItem;
  isSelected: boolean;
  onPress: () => void;
}

export function ReferenceChatRow({ item, isSelected, onPress }: ReferenceChatRowProps): ReactElement {
  return (
    <AppPressable onPress={onPress} className='py-12 gap-16 flex-row items-center'>
      <AppText numberOfLines={1} className='flex-1'>
        {item.title}
      </AppText>
      <AppText className='text-xs-sm sm:text-xs text-text-secondary'>
        {formatDateTime(item.updatedAt, 'relative-time')}
      </AppText>
      {isSelected && <Icon name='tick' />}
    </AppPressable>
  );
}
