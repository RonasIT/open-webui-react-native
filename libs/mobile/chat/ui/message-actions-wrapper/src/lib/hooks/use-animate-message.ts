import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export const useAnimateMessage = (): typeof result => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const startAnimation = (): void => {
    scale.value = withTiming(0.95, {
      duration: 200,
      easing: Easing.ease,
    });
  };

  const stopAnimation = (): void => {
    scale.value = withTiming(1, {
      duration: 200,
      easing: Easing.ease,
    });
  };

  const result = { animatedStyle, startAnimation, stopAnimation };

  return result;
};
