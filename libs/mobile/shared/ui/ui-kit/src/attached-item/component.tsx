import { ReactElement } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { Icon, IconName } from '../icon';
import { IconButton } from '../icon-button';
import { AppPressable, AppPressableProps } from '../pressable';
import { AppText } from '../text';
import { View } from '../view';

interface AttachedItemProps extends AppPressableProps {
  title: string;
  subTitle: string;
  iconName: IconName;
  onDeletePress?: () => void;
}

export function AttachedItem({
  title,
  subTitle,
  iconName,
  className,
  onDeletePress,
  ...restProps
}: AttachedItemProps): ReactElement {
  return (
    <AppPressable
      className={cn('rounded-lg flex-row bg-background-secondary items-center py-6 px-12', className)}
      {...restProps}>
      <Icon name={iconName} className='color-text-primary mr-16' />
      <View className='flex-1 flex-col justify-between'>
        <AppText className='text-md-sm sm:text-md'>{title}</AppText>
        <AppText className='text-sm-sm sm:text-sm text-text-secondary'>{subTitle}</AppText>
      </View>
      {onDeletePress && (
        <IconButton
          iconName='closeSM'
          hitSlop={8}
          onPress={onDeletePress}
          className='rounded-full bg-background-primary w-24 h-24 p-0 items-center justify-center'
          iconProps={{ className: 'color-text-primary', width: 8 }}
        />
      )}
    </AppPressable>
  );
}
