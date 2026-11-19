import { ReactElement } from 'react';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { AnimatedView, IconButton } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ReadAloudStopButton } from '../read-aloud-stop-button';

interface ChatBottomButtonProps {
  isVisible: SharedValue<number>;
  onPress: () => void;
}

export default function ChatBottomButton({ isVisible, onPress }: ChatBottomButtonProps): ReactElement | null {
  //NOTE: height is 0 when the keyboard is closed and -keyboardHeight when open, so it lifts the buttons above the keyboard
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: keyboardHeight.value ? keyboardHeight.value + 4 : -15 }],
  }));

  const scrollButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(isVisible.value, [0, 1], [0, 1]) }],
  }));

  // NOTE: The stop reading button sits under the scroll button, so both fit above the message bar
  return (
    <AnimatedView style={containerStyle} className='absolute right-16 bottom-[130] items-end gap-24'>
      <AnimatedView style={scrollButtonStyle}>
        <IconButton
          className='rounded-full border border-text-secondary bg-background-primary p-4'
          iconName='arrowDown'
          onPress={onPress}
        />
      </AnimatedView>
      <ReadAloudStopButton />
    </AnimatedView>
  );
}
