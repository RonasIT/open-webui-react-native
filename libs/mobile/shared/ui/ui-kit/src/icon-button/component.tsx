import { ReactElement } from 'react';
import { PressableProps as GesturePressableProps } from 'react-native-gesture-handler';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { Icon, IconProps } from '../icon/component';
import { IconName } from '../icon/types';
import { AppPressable, AppPressableProps, GestureAppPressable } from '../pressable';
import { AppSpinner } from '../spinner';

interface BaseIconButtonProps {
  iconName: IconName;
  iconProps?: Omit<IconProps, 'name'>;
  isLoading?: boolean;
  className?: string;
}

export type IconButtonProps =
  | (BaseIconButtonProps &
      AppPressableProps & {
        useGestureHandler?: false;
      })
  | (BaseIconButtonProps &
      GesturePressableProps & {
        useGestureHandler: true;
      });

const IconButtonContent = ({
  isLoading,
  iconName,
  iconProps,
}: Pick<BaseIconButtonProps, 'isLoading' | 'iconName' | 'iconProps'>): ReactElement =>
  isLoading ? <AppSpinner size='small' /> : <Icon name={iconName} {...iconProps} />;

export function IconButton(props: IconButtonProps): ReactElement {
  const baseClassName = cn('p-8 disabled:opacity-30 items-center justify-center', props.className);

  // NOTE: Pressable from react-native does not work correctly with react-native-modal - https://github.com/react-native-modal/react-native-modal/issues/582#issuecomment-1156723062
  if (props.useGestureHandler) {
    const { useGestureHandler, iconName, iconProps, isLoading, className, ...gestureProps } = props;

    return (
      <GestureAppPressable
        {...gestureProps}
        hitSlop={8}
        className={baseClassName}
        disabled={gestureProps.disabled || isLoading}>
        <IconButtonContent
          iconName={iconName}
          iconProps={iconProps}
          isLoading={isLoading} />
      </GestureAppPressable>
    );
  }

  const { useGestureHandler, iconName, iconProps, isLoading, className, ...rnProps } = props;

  return (
    <AppPressable
      {...rnProps}
      hitSlop={8}
      className={baseClassName}
      disabled={rnProps.disabled || isLoading}>
      <IconButtonContent
        iconName={iconName}
        iconProps={iconProps}
        isLoading={isLoading} />
    </AppPressable>
  );
}
