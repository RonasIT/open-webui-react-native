import dayjs from 'dayjs';
import { ReactElement, useEffect, useRef } from 'react';
import { Easing, useDerivedValue, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useDictateMode } from '@open-web-ui-mobile-client-react-native/mobile/shared/features/use-dictate-mode';
import { cn } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';
import { View, AppText, IconButton } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { WaveBar } from './components';
import { soundWaveConfig } from './config';

interface SoundWaveRecorderProps {
  isRecordingStarted: boolean;
  onStartRecording: () => void;
  onCompleteRecording: (text: string) => void;
  onStopRecording: () => void;
}

const { waveBarsAmount, hz, threshold } = soundWaveConfig;
const waveBars = Array.from({ length: waveBarsAmount }, (_, i) => i);
const animationDuration = (waveBarsAmount * 1000) / hz;

export function SoundWaveRecorder({
  isRecordingStarted,
  onStartRecording,
  onCompleteRecording,
  onStopRecording,
}: SoundWaveRecorderProps): ReactElement {
  const recordingDuration = useRef(0);

  const lastBuffer = useSharedValue(new Array(waveBarsAmount).fill(0));
  const meteringValue = useSharedValue(0);
  const waveOffset = useSharedValue(0);

  const {
    durationMillis,
    isRecording,
    isTranscribing,
    startSpeechRecording,
    completeSpeechRecording,
    stopSpeechRecording,
    metering,
  } = useDictateMode({
    onStartRecording,
    onCompleteRecording,
    onStopRecording,
  });

  const amplitudeBuffer = useDerivedValue(() => {
    if (isRecording) {
      const buffer = [...lastBuffer.value];

      for (let i = 0; i < waveBarsAmount - 1; i++) {
        buffer[i] = buffer[i + 1];
      }

      const currentAmplitude = meteringValue.value > threshold ? meteringValue.value : 0;
      buffer[waveBarsAmount - 1] = currentAmplitude;

      lastBuffer.value = buffer;
    }

    return lastBuffer.value;
  });

  useEffect(() => {
    if (isRecordingStarted) {
      startSpeechRecording();
    }
  }, [isRecordingStarted]);

  useEffect(() => {
    if (isRecording) {
      waveOffset.value = withRepeat(
        withTiming(waveBarsAmount, { duration: animationDuration, easing: Easing.linear }),
        -1,
        false,
      );
    }
  }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      recordingDuration.current = durationMillis;
    }
  }, [durationMillis]);

  useEffect(() => {
    if (metering) {
      meteringValue.value = withTiming(metering, { duration: 200 });
    }
  }, [metering]);

  const renderWaveBar = (_: number, index: number): ReactElement => (
    <WaveBar
      key={index}
      index={index}
      amplitudeBuffer={amplitudeBuffer}
      isRecording={isRecording} />
  );

  return (
    <View className='p-12 bg-brand-secondary-transparent rounded-2xl'>
      <View className='flex-row items-center h-[23px] mb-8'>{waveBars.map(renderWaveBar)}</View>
      <View className='flex-row justify-between items-center'>
        <IconButton
          onPress={stopSpeechRecording}
          disabled={isTranscribing}
          iconName='close'
          className='h-[28px] w-[28px] justify-center items-center rounded-full bg-brand-secondary-transparent'
          iconProps={{ className: 'color-brand-secondary', height: 20, width: 20 }}
        />
        <AppText className={cn('text-brand-secondary text-sm', isTranscribing && 'opacity-30')}>
          {dayjs(recordingDuration.current).format('mm:ss')}
        </AppText>
        <IconButton
          onPress={completeSpeechRecording}
          isLoading={isTranscribing}
          iconName='checked'
          className='h-[28px] w-[28px] justify-center items-center rounded-full bg-brand-secondary'
          iconProps={{ className: 'color-white', height: 20, width: 20 }}
        />
      </View>
    </View>
  );
}
