import { ReactElement } from 'react';
import { AppPressable, AppText, Icon, IconName, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { FolderListItem } from '@open-webui-react-native/shared/data-access/api';

export interface SelectFolderRowProps {
  item: FolderListItem;
  onPress: () => void;
  isSelected: boolean | undefined;
  iconName?: IconName;
  iconClassName?: string;
  textClassName?: string;
}

export function SelectFolderRow({
  item,
  onPress,
  isSelected,
  iconName = 'folder',
  iconClassName,
  textClassName,
}: SelectFolderRowProps): ReactElement {
  return (
    <AppPressable onPress={onPress} className='py-12 gap-16 flex-row items-center justify-between'>
      <View className='flex-row items-center gap-12'>
        <Icon name={iconName} className={iconClassName} />
        <AppText className={textClassName}>{item.name}</AppText>
      </View>

      {isSelected && <Icon name='tick' />}
    </AppPressable>
  );
}
