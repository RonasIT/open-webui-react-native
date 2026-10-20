import { ReactElement } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { Icon, IconName, IconProps } from '../../../icon';
import { AppPressable, AppPressableProps } from '../../../pressable';
import { AppSpinner } from '../../../spinner';
import { AppText } from '../../../text';
import { View } from '../../../view';

export interface ActionSheetItemProps extends AppPressableProps {
  title: string;
  value?: string;
  isCentered?: boolean;
  isIconShown?: boolean;
  iconName?: IconName;
  iconProps?: Partial<IconProps>;
  isLoading?: boolean;
  isDanger?: boolean;
  hasSubActions?: boolean;
  numberOfLines?: number;
  rightContent?: ReactElement;
}

export function ActionSheetItem({
  title,
  value,
  isCentered,
  className,
  isIconShown = true,
  iconName,
  iconProps,
  isLoading,
  isDanger,
  hasSubActions = false,
  numberOfLines,
  rightContent,
  disabled,
  ...restProps
}: ActionSheetItemProps): ReactElement {
  return (
    <AppPressable
      className={cn(
        `bg-background-primary px-24 py-20 gap-12 flex-row items-center active:opacity-100 active:bg-background-secondary`,
        isCentered ? 'justify-center' : 'justify-start',
        className,
      )}
      disabled={disabled}
      {...restProps}>
      {isLoading ? (
        <View className='h-24 w-24'>
          <AppSpinner size='small' />
        </View>
      ) : (
        iconName && (
          <View className='h-24 w-24'>
            {isIconShown && (
              <Icon
                name={iconName}
                {...iconProps}
                className={cn(
                  isDanger && 'color-status-danger',
                  iconProps?.className,
                  disabled && 'color-text-tertiary',
                )}
              />
            )}
          </View>
        )
      )}
      <AppText
        numberOfLines={numberOfLines}
        className={cn(
          'text-md-sm sm:text-md',
          disabled ? 'text-text-tertiary' : isDanger && 'text-status-danger',
          !value && numberOfLines && 'flex-1',
        )}>
        {title}
      </AppText>
      {(!!value || hasSubActions || rightContent) && (
        <View className='min-w-0 flex-1 flex-row items-center justify-end gap-8'>
          {!!value && (
            <AppText
              numberOfLines={1}
              className={cn(
                'shrink text-right text-sm-sm sm:text-sm',
                disabled ? 'text-text-tertiary' : 'text-text-secondary',
              )}>
              {value}
            </AppText>
          )}
          {rightContent}
          {hasSubActions && <Icon name='chevronRight' className={cn('shrink-0', disabled && 'color-text-tertiary')} />}
        </View>
      )}
    </AppPressable>
  );
}
