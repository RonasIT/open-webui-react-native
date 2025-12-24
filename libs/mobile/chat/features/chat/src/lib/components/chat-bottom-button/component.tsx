import { ReactElement } from 'react';
import { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { AnimatedView, IconButton } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

interface ChatBottomButtonProps {
  isVisible: SharedValue<number>;
  onPress: () => void;
}

export default function ChatBottomButton({ isVisible, onPress }: ChatBottomButtonProps): ReactElement | null {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(isVisible.value, [0, 1], [0, 1]) }],
  }));

  return (
    <AnimatedView style={animatedStyle} className='absolute right-16 bottom-6'>
      <IconButton
        className='rounded-full border border-text-secondary bg-background-primary p-4'
        iconName='arrowDown'
        onPress={onPress}
      />
    </AnimatedView>
  );
}
