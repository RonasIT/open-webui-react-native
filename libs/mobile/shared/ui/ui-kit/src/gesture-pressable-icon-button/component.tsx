import { ReactElement } from 'react';
import { PressableProps as GesturePressableProps } from 'react-native-gesture-handler';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { Icon, IconProps } from '../icon/component';
import { IconName } from '../icon/types';
import { GestureAppPressable } from '../pressable';
import { AppSpinner } from '../spinner';

export interface GesturePressableIconButtonProps extends GesturePressableProps {
  iconName: IconName;
  iconProps?: Omit<IconProps, 'name'>;
  isLoading?: boolean;
  className?: string;
}

export function GesturePressableIconButton({
  iconName,
  iconProps,
  isLoading,
  disabled,
  className,
  ...pressableProps
}: GesturePressableIconButtonProps): ReactElement {
  return (
    <GestureAppPressable
      {...pressableProps}
      hitSlop={8}
      disabled={disabled || isLoading}
      className={cn('p-8 disabled:opacity-30 items-center justify-center', className)}>
      {isLoading ? <AppSpinner size='small' /> : <Icon name={iconName} {...iconProps} />}
    </GestureAppPressable>
  );
}
