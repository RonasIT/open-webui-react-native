import * as Haptics from 'expo-haptics';
import { cssInterop } from 'nativewind';
import { Ref, ReactElement } from 'react';
import { View, Pressable, PressableProps, Platform, GestureResponderEvent } from 'react-native';
import { Pressable as GesturePressable, PressableProps as GesturePressableProps } from 'react-native-gesture-handler';
import { PressableEvent } from 'react-native-gesture-handler/lib/typescript/components/Pressable/PressableProps';
import { cn } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';

const hapticImpactHandler = async (): Promise<void> =>
  Platform.OS === 'ios'
    ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    : Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Long_Press);

// NOTE: The Pressable style callback function and pressed state are not working with nativewind, more info: https://github.com/nativewind/nativewind/issues/847
export interface AppPressableProps extends PressableProps {
  ref?: Ref<View>;
  className?: string;
}

const AppPressable = ({ ref, className, onLongPress, ...props }: AppPressableProps): ReactElement => {
  const onLongPressHandler = async (event: GestureResponderEvent): Promise<void> => {
    await hapticImpactHandler();
    onLongPress?.(event);
  };

  return (
    <Pressable
      ref={ref}
      className={cn('active:opacity-40', className)}
      onLongPress={onLongPressHandler}
      {...props} />
  );
};

const CustomizedGestureAppPressable = cssInterop(GesturePressable, {
  className: 'style',
});

// NOTE: Pressable from react-native does not work correctly with react-native-modal - https://github.com/react-native-modal/react-native-modal/issues/582#issuecomment-1156723062
const GestureAppPressable = ({ className, onLongPress, ...props }: GesturePressableProps): ReactElement => {
  const onLongPressHandler = async (event: PressableEvent): Promise<void> => {
    await hapticImpactHandler();
    onLongPress?.(event);
  };

  return (
    <CustomizedGestureAppPressable
      className={cn('active:opacity-40', className)}
      onLongPress={onLongPressHandler}
      {...props}
    />
  );
};

AppPressable.displayName = 'AppPressable';
GestureAppPressable.displayName = 'GestureAppPressable';
export { AppPressable, GestureAppPressable };
