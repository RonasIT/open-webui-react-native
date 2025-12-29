import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useBottomInset(minPadding = 24): number {
  const { bottom } = useSafeAreaInsets();
  const visualPadding = 16;

  if (Platform.OS === 'android') {
    return Math.max(bottom, minPadding) + visualPadding;
  }

  return bottom;
}
