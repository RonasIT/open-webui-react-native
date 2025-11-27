import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Modal, { ModalProps } from 'react-native-modal';
import { useCreateNewChat } from '@open-webui-react-native/mobile/chat/features/use-create-new-chat';
import { useSendMessage } from '@open-webui-react-native/mobile/chat/features/use-send-message';
import { speechStreamingService } from '@open-webui-react-native/mobile/shared/data-access/speech-streaming-service';
import { useDictateMode } from '@open-webui-react-native/mobile/shared/features/use-dictate-mode';
import { colors, useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppSafeAreaView, AppText, AppToast, IconButton, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { chatApi } from '@open-webui-react-native/shared/data-access/api';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { Loader, SpeechListener } from './components';
import { voiceModeModalConfig } from './config';

export type VoiceModeModalMethods = {
  present: ({ chatId, modelId }: { chatId?: string; modelId: string }) => Promise<void>;
  close: () => Promise<void>;
};

export type VoiceModeModalRef = ForwardedRef<VoiceModeModalMethods>;

export interface VoiceModeModalProps extends Partial<ModalProps> {
  onChatCreated?: (id: string) => void;
  ref?: VoiceModeModalRef;
}

const { meteringSilenceThreshold, meteringSilenceDuration } = voiceModeModalConfig;

export function VoiceModeModal({ onChatCreated, ref, ...props }: VoiceModeModalProps): ReactElement {
  const translate = useTranslation('CHAT.VOICE_MODE_MODAL');
  const { isDarkColorScheme } = useColorScheme();

  const silenceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isVisible, setIsVisible] = useState(false);

  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const [isWaitingNewMessage, setIsWaitingNewMessage] = useState(false);
  const [isReceivingNewMessage, setIsReceivingNewMessage] = useState(false);

  const [chatId, setChatId] = useState<string | undefined>(undefined);
  const [modelId, setModelId] = useState<string>('');

  const handleChatCreated = (id: string): void => {
    if (isVisible) {
      setChatId(id);
      onChatCreated?.(id);
    }
  };

  const { data: chat, isLoading } = chatApi.useGet(chatId as string, { enabled: !!chatId });
  const { sendMessage, isLoading: isSending } = useSendMessage({ chatData: chat });
  const { startChatCreation, isLoading: isCreating } = useCreateNewChat({ onSuccess: handleChatCreated });

  const { isTranscribing, startSpeechRecording, stopSpeechRecording, completeSpeechRecording, metering } =
    useDictateMode({
      updateIntervalMillis: 100,
      onCompleteRecording: (text: string) => {
        if (text.trim().length) {
          if (chatId) {
            sendMessage(text, modelId);
          } else {
            startChatCreation(text, modelId);
          }

          setIsWaitingNewMessage(true);
        } else {
          startSpeechRecording();
        }
      },
    });

  const newMessage = chat?.chat.messages.find((message) => message.id === chat.chat.history.currentId);
  const isThinking =
    isCreating || isSending || isLoading || isTranscribing || isWaitingNewMessage || isReceivingNewMessage;

  const close = async (): Promise<void> => {
    await stopSpeechRecording();
    await speechStreamingService.stopContentSpeaking();
    clearSilenceTimeout();
    setIsUserSpeaking(false);
    setIsAiSpeaking(false);
    setIsWaitingNewMessage(false);
    setIsReceivingNewMessage(false);
    setIsVisible(false);
  };

  useImperativeHandle(
    ref,
    () => ({
      present: async ({ chatId, modelId }: { chatId?: string; modelId: string }): Promise<void> => {
        // NOTE: If chat exists, we get its ID
        setChatId(chatId);
        setModelId(modelId);
        await startSpeechRecording();
        setIsVisible(true);
      },
      close,
    }),
    [],
  );

  const showUnderConstruction = (): void => ToastService.showFeatureNotImplemented();

  const clearSilenceTimeout = (): void => {
    if (silenceTimeout.current) {
      clearTimeout(silenceTimeout.current);
      silenceTimeout.current = null;
    }
  };

  const startSilenceTimeout = (): void => {
    if (silenceTimeout.current) {
      return;
    }

    silenceTimeout.current = setTimeout(() => {
      setIsUserSpeaking(false);
      completeSpeechRecording();
    }, meteringSilenceDuration);
  };

  useEffect(() => {
    if (isVisible) {
      speechStreamingService.onSpeakingStart(() => {
        setIsAiSpeaking(true);
      });
      speechStreamingService.onSpeakingEnd(async () => {
        await startSpeechRecording();
        setIsAiSpeaking(false);
      });
    } else {
      speechStreamingService.clearListeners();
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      if (isWaitingNewMessage && newMessage && !newMessage.done) {
        // NOTE: In this case, we start receiving a new message via WebSocket
        setIsWaitingNewMessage(false);
        setIsReceivingNewMessage(true);
        speechStreamingService.handleContent(newMessage.content);
      }

      if (isReceivingNewMessage && newMessage) {
        speechStreamingService.handleContent(newMessage.content, newMessage.done);

        if (newMessage.done) {
          setIsReceivingNewMessage(false);
        }
      }
    }
  }, [isVisible, isWaitingNewMessage, isReceivingNewMessage, newMessage?.content.length, newMessage?.done]);

  useEffect(() => {
    if (!isVisible || metering === undefined) {
      return;
    }

    if (metering > meteringSilenceThreshold && !isUserSpeaking) {
      setIsUserSpeaking(true);
      clearSilenceTimeout();
    }

    if (isUserSpeaking) {
      if (metering < meteringSilenceThreshold) {
        // NOTE: We need to wait for a silence duration before stopping the recording
        startSilenceTimeout();
      } else {
        clearSilenceTimeout();
      }
    }
  }, [isVisible, metering, isUserSpeaking]);

  return (
    <Modal
      isVisible={isVisible}
      hideModalContentWhileAnimating={true}
      backdropColor={isDarkColorScheme ? colors.darkBackgroundPrimary : colors.backgroundPrimary}
      backdropOpacity={1}
      backdropTransitionOutTiming={1}
      animationOutTiming={1}
      animationIn='fadeIn'
      style={{ overflow: 'hidden' }}
      {...props}>
      <AppSafeAreaView edges={['bottom']} className='flex-1'>
        <View className='flex-1 items-center justify-center'>
          {isThinking || isAiSpeaking ? <Loader /> : <SpeechListener metering={metering} />}
        </View>
        <View className='flex-row justify-between items-center p-12'>
          <IconButton
            iconName='camera'
            onPress={showUnderConstruction}
            className='w-40 h-40 bg-background-secondary rounded-full'
          />
          <AppText className='text-sm-sm sm:text-sm'>
            {isAiSpeaking
              ? translate('TEXT_TALKING')
              : isThinking
                ? translate('TEXT_THINKING')
                : translate('TEXT_LISTENING')}
          </AppText>
          <IconButton
            iconName='close'
            onPress={close}
            className='w-40 h-40 bg-background-secondary rounded-full' />
        </View>
      </AppSafeAreaView>
      <AppToast />
    </Modal>
  );
}
