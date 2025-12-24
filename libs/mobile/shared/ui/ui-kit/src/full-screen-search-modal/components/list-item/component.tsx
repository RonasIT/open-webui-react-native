import { ReactElement } from 'react';
import { cn, useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';
import { Icon, IconName } from '../../../icon';
import { AppPressable } from '../../../pressable';
import { AppText } from '../../../text';
import { View } from '../../../view';

export interface ListItemProps {
  onSelect: () => void;
  name: string;
  isSelected: boolean;
  iconName?: IconName;
  containerClassName?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function ListItem({
  name,
  onSelect,
  isSelected,
  iconName,
  containerClassName,
  iconClassName,
  textClassName,
}: ListItemProps): ReactElement {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <AppPressable onPress={onSelect}>
      <View className={cn('flex-row gap-16 items-center py-16 rounded-xl flex-1', containerClassName)}>
        <View className='flex-1 gap-16 flex-row items-center '>
          <Icon name={iconName || (isDarkColorScheme ? 'logoSmallDark' : 'logoSmallLight')} className={iconClassName} />
          <AppText className={cn('text-md-sm sm:text-md flex-1', textClassName)}>{name}</AppText>
        </View>
        {!!isSelected && <Icon name='checkedSmall' />}
      </View>
    </AppPressable>
  );
}
