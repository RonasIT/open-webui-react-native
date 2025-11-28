import { ReactElement } from 'react';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { Icon, IconName, IconProps } from '../../../icon';
import { AppPressable, AppPressableProps } from '../../../pressable';
import { AppSpinner } from '../../../spinner';
import { AppText } from '../../../text';
import { View } from '../../../view';

export interface ActionSheetItemProps extends AppPressableProps {
  title: string;
  isCentered?: boolean;
  isIconShown?: boolean;
  iconName?: IconName;
  iconProps?: Partial<IconProps>;
  isLoading?: boolean;
  isDanger?: boolean;
}

export function ActionSheetItem({
  title,
  isCentered,
  className,
  isIconShown = true,
  iconName,
  iconProps,
  isLoading,
  isDanger,
  ...restProps
}: ActionSheetItemProps): ReactElement {
  return (
    <AppPressable
      className={cn(
        `bg-background-primary px-24 py-20 gap-12 flex-row items-center active:opacity-100 active:bg-background-secondary`,
        isCentered ? 'justify-center' : 'justify-start',
        className,
      )}
      {...restProps}>
      {isLoading ? (
        <View className='h-24 w-24'>
          <AppSpinner size='small' />
        </View>
      ) : (
        iconName && (
          <View className='h-24 w-24'>
            {isIconShown && <Icon
              name={iconName}
              className={cn(isDanger && 'color-status-danger')}
              {...iconProps} />}
          </View>
        )
      )}
      <AppText className={cn(`text-md-sm sm:text-md`, isDanger && 'text-status-danger')}>{title}</AppText>
    </AppPressable>
  );
}
