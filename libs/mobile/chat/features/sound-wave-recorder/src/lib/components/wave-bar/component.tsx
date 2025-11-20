import { ReactElement } from 'react';
import { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { AnimatedView } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { soundWaveConfig } from '../../config';

interface WaveBarProps {
  index: number;
  amplitudeBuffer: SharedValue<Array<number>>;
  isRecording: boolean;
}

export function WaveBar({ index, amplitudeBuffer, isRecording }: WaveBarProps): ReactElement {
  const { waveMinHeight, waveMaxHeight } = soundWaveConfig;

  const animatedStyle = useAnimatedStyle(() => {
    const amplitude = amplitudeBuffer.value[index] || 0;

    return {
      height: waveMinHeight + amplitude * (waveMaxHeight - waveMinHeight),
      opacity: isRecording ? 1 : 0.3,
    };
  });

  return <AnimatedView style={animatedStyle} className='flex-1 min-h-[2.5px] mx-[1px] bg-brand-secondary' />;
}
