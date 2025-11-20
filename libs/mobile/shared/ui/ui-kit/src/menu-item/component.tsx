import { ReactElement } from 'react';
import { Icon, IconName } from '../icon';
import { AppPressable } from '../pressable';
import { AppSpinner } from '../spinner';
import { AppText } from '../text';
import { View } from '../view';

interface MenuItemProps {
  iconName: IconName;
  title: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function MenuItem({ iconName, title, onPress, disabled, isLoading }: MenuItemProps): ReactElement {
  return (
    <AppPressable onPress={onPress} disabled={disabled}>
      <View className='flex-row gap-16 items-center px-12 py-8'>
        <View className='w-16'>
          {isLoading ? (
            <AppSpinner size='small' />
          ) : (
            <Icon
              width={24}
              height={24}
              name={iconName}
              className='color-icon' />
          )}
        </View>
        <AppText className='text-h4-sm sm:text-h4'>{title}</AppText>
      </View>
    </AppPressable>
  );
}
