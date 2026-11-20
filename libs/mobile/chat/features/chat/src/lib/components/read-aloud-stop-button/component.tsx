import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { speechStreamingService } from '@open-webui-react-native/mobile/shared/data-access/speech-streaming-service';
import { AnimatedView, IconButton, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

export default function ReadAloudStopButton(): ReactElement | null {
  const translate = useTranslation('CHAT.AI_MESSAGE_ACTIONS');
  const isSpeaking = useSelector(() => !!speechStreamingService.speakingMessageId$.get());
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = isSpeaking ? withRepeat(withTiming(1, { duration: 800 }), -1, true) : 0;
  }, [isSpeaking]);

  const haloStyle = useAnimatedStyle(() => ({ transform: [{ scale: 0.8 + pulse.value * 0.2 }] }));

  if (!isSpeaking) {
    return null;
  }

  return (
    <View className='items-center justify-center'>
      <AnimatedView
        style={haloStyle}
        className='absolute h-[71px] w-[71px] rounded-full bg-brand-secondary-transparent'
      />
      <IconButton
        accessibilityLabel={translate('TEXT_STOP_READING_ALOUD')}
        onPress={() => void speechStreamingService.stopContentSpeaking()}
        iconName='pause'
        className='p-12 rounded-full bg-brand-secondary'
        iconProps={{ className: 'color-white' }}
      />
    </View>
  );
}
