import { ReactElement, useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import { AnimatedView, View } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';

export function Loader(): ReactElement {
  const translateY1 = useSharedValue(0);
  const translateY2 = useSharedValue(0);
  const translateY3 = useSharedValue(0);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY1.value }],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY2.value }],
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY3.value }],
  }));

  useEffect(() => {
    const animationConfig = {
      duration: 600,
      useNativeDriver: true,
    };

    translateY1.value = withRepeat(withTiming(-34, animationConfig), -1, true);

    translateY2.value = withDelay(200, withRepeat(withTiming(-34, animationConfig), -1, true));

    translateY3.value = withDelay(400, withRepeat(withTiming(-34, animationConfig), -1, true));
  }, []);

  return (
    <View className='flex-row gap-12'>
      <AnimatedView style={animatedStyle1} className='h-[34px] w-[34px] rounded-full bg-text-primary' />
      <AnimatedView style={animatedStyle2} className='h-[34px] w-[34px] rounded-full bg-text-primary' />
      <AnimatedView style={animatedStyle3} className='h-[34px] w-[34px] rounded-full bg-text-primary' />
    </View>
  );
}
