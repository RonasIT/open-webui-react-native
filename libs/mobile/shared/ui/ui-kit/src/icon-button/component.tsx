import { ReactElement } from 'react';
import { cn } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';
import { Icon, IconProps } from '../icon/component';
import { IconName } from '../icon/types';
import { AppPressable, AppPressableProps } from '../pressable';
import { AppSpinner } from '../spinner';

export interface IconButtonProps extends AppPressableProps {
  iconName: IconName;
  iconProps?: Omit<IconProps, 'name'>;
  isLoading?: boolean;
}

export function IconButton({
  className,
  iconName,
  iconProps,
  isLoading,
  disabled,
  ...restProps
}: IconButtonProps): ReactElement {
  return (
    <AppPressable
      hitSlop={8}
      disabled={disabled || isLoading}
      className={cn('p-8 disabled:opacity-30 items-center justify-center', className)}
      {...restProps}>
      {isLoading ? <AppSpinner size='small' /> : <Icon name={iconName} {...iconProps} />}
    </AppPressable>
  );
}
