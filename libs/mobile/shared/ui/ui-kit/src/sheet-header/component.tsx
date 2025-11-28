import { ReactElement } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { IconButton, IconButtonProps } from '../icon-button';
import { AppText } from '../text';
import { View, ViewProps } from '../view';

export interface SheetHeaderProps extends ViewProps {
  title: string | ReactElement;
  accessoryRight?: ReactElement;
  accessoryLeft?: ReactElement;
  onGoBack?: () => void;
  onConfirmPress?: () => void;
  confirmButtonProps?: Partial<IconButtonProps>;
}

export function SheetHeader({
  title,
  accessoryLeft,
  accessoryRight,
  className,
  onGoBack,
  onConfirmPress,
  confirmButtonProps,
  ...restProps
}: SheetHeaderProps): ReactElement {
  const renderDefaultCancelButton = (): ReactElement =>
    onGoBack ? (
      <IconButton
        onPress={onGoBack}
        iconName='close'
        className='bg-background-secondary rounded-full p-10' />
    ) : (
      <View />
    );

  const renderDefaultActionButton = (): ReactElement =>
    onConfirmPress ? (
      <IconButton
        onPress={onConfirmPress}
        iconName='checked'
        iconProps={{ className: 'color-background-primary' }}
        className='bg-text-primary rounded-full p-10 min-w-44 min-h-44'
        {...confirmButtonProps}
      />
    ) : (
      <View />
    );

  return (
    <View className={cn('flex-row items-center justify-between bg-background-primary pb-10', className)} {...restProps}>
      <View className='min-w-64 items-start justify-center'>
        {accessoryLeft ? accessoryLeft : renderDefaultCancelButton()}
      </View>
      {typeof title === 'string' ? <AppText className='font-medium'>{title}</AppText> : title}
      <View className='min-w-64 items-end justify-center'>
        {accessoryRight ? accessoryRight : renderDefaultActionButton()}
      </View>
    </View>
  );
}
