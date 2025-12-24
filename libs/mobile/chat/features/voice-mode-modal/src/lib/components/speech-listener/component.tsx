import { ReactElement, useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { AnimatedView } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { voiceModeModalConfig } from '../../config';

export interface SpeechListenerProps {
  metering?: number;
}

const { meteringSilenceThreshold } = voiceModeModalConfig;

export function SpeechListener({ metering }: SpeechListenerProps): ReactElement {
  const scale = useSharedValue(1);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    const scalingMetering = metering ? 1 + (metering < meteringSilenceThreshold ? 0 : metering) : 1;

    scale.value = withSpring(scalingMetering, {
      damping: 8,
      stiffness: 300,
    });
  }, [metering]);

  return <AnimatedView style={animatedCircleStyle} className='h-[126px] w-[126px] rounded-full bg-text-primary' />;
}
