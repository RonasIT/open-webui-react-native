import { Platform } from 'react-native';

export const useDictateModeConfig = {
  silenceMetering: Platform.OS === 'ios' ? -60 : -40,
};
