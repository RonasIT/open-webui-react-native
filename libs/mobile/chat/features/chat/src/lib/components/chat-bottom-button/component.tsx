import { ReactElement } from 'react';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { AnimatedView, IconButton } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

interface ChatBottomButtonProps {
  isVisible: SharedValue<number>;
  onPress: () => void;
}

export default function ChatBottomButton({ isVisible, onPress }: ChatBottomButtonProps): ReactElement | null {
  //NOTE: height is 0 when the keyboard is closed and -keyboardHeight when open, so it lifts the button above the keyboard
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: keyboardHeight.value ? keyboardHeight.value + 15 : 0 },
      { scale: interpolate(isVisible.value, [0, 1], [0, 1]) },
    ],
  }));

  return (
    <AnimatedView style={animatedStyle} className='absolute right-16 bottom-[130]'>
      <IconButton
        className='rounded-full border border-text-secondary bg-background-primary p-4'
        iconName='arrowDown'
        onPress={onPress}
      />
    </AnimatedView>
  );
}
