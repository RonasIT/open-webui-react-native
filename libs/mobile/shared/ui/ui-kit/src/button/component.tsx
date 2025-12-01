import { ReactElement } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { Icon, IconName } from '../icon';
import { AppPressable, AppPressableProps } from '../pressable';
import { AppSpinner } from '../spinner';
import { AppText } from '../text';
import { View } from '../view';

type ButtonVariants = {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md';
};

type AppButtonProps = {
  text: string;
  iconName?: IconName;
  isLoading?: boolean;
  isFullWidth?: boolean;
  className?: string;
  iconClassName?: string;
} & ButtonVariants &
  Omit<AppPressableProps, 'children'>;

const getButtonClasses = ({
  variant = 'solid',
  size = 'md',
  disabled,
  isFullWidth,
}: ButtonVariants & { disabled?: boolean; isFullWidth?: boolean }): {
  containerClasses: string;
  textClasses: string;
  pressedTextClasses: string;
} => {
  const baseClasses = ['rounded-[40px]', 'items-center', 'justify-center'];

  const containerClasses = {
    solid: 'bg-text-primary active:bg-text-secondary',
    outline: 'border border-text-primary bg-transparent active:border-text-secondary',
    ghost: 'bg-transparent',
  };

  const disabledContainerClasses = {
    solid: 'bg-background-tertiary',
    outline: 'border-text-tertiary',
    ghost: 'bg-transparent',
  };

  const containerSizeClasses = {
    md: 'px-24 py-18 min-h-[48px]',
    sm: 'px-8 py-12 min-h-[32px]',
    xs: 'px-8 py-[3px] min-h-[28px]',
  };

  const textClasses = {
    solid: 'text-background-primary',
    outline: 'text-text-primary',
    ghost: 'text-text-primary',
  };

  const disabledTextClasses = {
    solid: 'text-text-secondary',
    outline: 'text-text-tertiary',
    ghost: 'text-text-tertiary',
  };

  const pressedTextClasses = {
    solid: 'text-background-primary',
    outline: 'text-text-secondary',
    ghost: 'text-text-secondary',
  };

  const textSizeClasses = {
    md: 'text-md-sm sm:text-md font-medium',
    sm: 'text-sm-sm sm:text-sm font-medium',
    xs: 'text-sm-sm sm:text-sm font-normal',
  };

  return {
    containerClasses: cn([
      ...baseClasses,
      disabled ? disabledContainerClasses[variant] : containerClasses[variant],
      containerSizeClasses[size],
      isFullWidth && 'flex-1',
    ]),
    textClasses: cn([disabled ? disabledTextClasses[variant] : textClasses[variant], textSizeClasses[size]]),
    pressedTextClasses: pressedTextClasses[variant],
  };
};

export const AppButton = ({
  text,
  iconName,
  variant,
  size,
  isLoading,
  isFullWidth,
  disabled,
  className,
  iconClassName,
  ...pressableProps
}: AppButtonProps): ReactElement => {
  const { containerClasses, textClasses, pressedTextClasses } = getButtonClasses({
    variant,
    size,
    disabled: !!disabled,
    isFullWidth,
  });

  return (
    <AppPressable
      className={cn(containerClasses, className)}
      disabled={disabled || isLoading}
      {...pressableProps}>
      {isLoading ? (
        <AppSpinner size='small' />
      ) : (
        ({ pressed }) => (
          <View className='gap-8 flex-row items-center'>
            {iconName && <Icon
              name={iconName}
              width={24}
              height={24}
              className={iconClassName} />}
            <AppText className={cn(textClasses, pressed && pressedTextClasses)}>{text}</AppText>
          </View>
        )
      )}
    </AppPressable>
  );
};
