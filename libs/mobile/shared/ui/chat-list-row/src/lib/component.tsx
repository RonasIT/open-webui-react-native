import { ReactElement } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';
import { View, AppText, AppPressable, AppPressableProps } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { chatListRowConfig } from '../config';

export interface ChatListRowProps extends Omit<AppPressableProps, 'onPress'> {
  title: string;
  chatId: string;
  onPress: (id: string) => void;
  isSelected?: boolean;
  accessoryRight?: ReactElement;
  onLongPress?: () => void;
}

export function ChatListRow({
  title,
  chatId,
  onPress,
  isSelected,
  className,
  accessoryRight,
  onLongPress,
  ...restProps
}: ChatListRowProps): ReactElement {
  const { delayLongPress, longPressAnimationDuration } = chatListRowConfig;

  const handlePress = (): void => onPress(chatId);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    flexDirection: 'row',
    alignItems: 'center',
  }));

  const handleLongPressIn = (): void => {
    if (onLongPress) {
      scale.value = withTiming(0.95, {
        duration: longPressAnimationDuration,
        easing: Easing.ease,
      });

      onLongPress?.();
    }
  };

  const handlePressOut = (): void => {
    scale.value = withTiming(1, {
      duration: longPressAnimationDuration,
      easing: Easing.ease,
    });
  };

  return (
    <AppPressable
      className={cn(
        'bg-background-primary px-16 py-12 gap-12 flex-row items-center active:opacity-100 active:bg-background-secondary',
        className,
      )}
      onPress={handlePress}
      onLongPress={handleLongPressIn}
      onPressOut={handlePressOut}
      delayLongPress={delayLongPress}
      {...restProps}>
      <View className='relative flex-row flex-1 items-center h-[28]'>
        <Animated.View style={animatedStyle}>
          <AppText numberOfLines={1} className='flex-1'>
            {title}
          </AppText>
          {accessoryRight && <View>{accessoryRight}</View>}
        </Animated.View>
      </View>
    </AppPressable>
  );
}
