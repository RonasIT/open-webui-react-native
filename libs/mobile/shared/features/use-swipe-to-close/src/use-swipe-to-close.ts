import { Gesture } from 'react-native-gesture-handler';
import {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { screenHeight } from '@open-webui-react-native/mobile/shared/ui/styles';

interface UseSwipeToCloseParams {
  onReachDistance: () => void;
  scrollDirection?: 'up' | 'down' | 'all';
}

export const useSwipeToClose = ({ onReachDistance, scrollDirection = 'all' }: UseSwipeToCloseParams): typeof result => {
  const translateY = useSharedValue(0);

  const animatedOpacityStyles = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [-screenHeight / 2.5, 0, screenHeight / 2.5],
      [0, 1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const animatedScaleStyles = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      {
        scale: interpolate(translateY.value, [-screenHeight, 0, screenHeight], [0, 1, 0], Extrapolation.CLAMP),
      },
    ],
  }));

  const panGesture = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .failOffsetX([-10, 10])
    .onChange((event) => {
      switch (scrollDirection) {
        case 'up':
          translateY.value = Math.min(event.translationY, 0);
          break;
        case 'down':
          translateY.value = Math.max(event.translationY, 0);
          break;
        case 'all':
          translateY.value = event.translationY;
          break;
        default:
          translateY.value = 0;
      }
    })
    .onEnd(() => {
      if (Math.abs(translateY.value) > 125) {
        runOnJS(onReachDistance)();
        translateY.value = withTiming(0, { duration: 750 });
      } else {
        translateY.value = withTiming(0, { duration: 350 });
      }
    });

  const result = { translateY, animatedOpacityStyles, animatedScaleStyles, panGesture };

  return result;
};
