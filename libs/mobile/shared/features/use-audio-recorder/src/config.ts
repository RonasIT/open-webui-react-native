import { RecordingOptions, RecordingPresets } from 'expo-audio';

export const recordingOptions: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  numberOfChannels: 1,
  isMeteringEnabled: true,
};
