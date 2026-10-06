import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ForwardedRef, ReactElement, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Modal, { ModalProps } from 'react-native-modal';
import { useCreateNewChat } from '@open-webui-react-native/mobile/chat/features/use-create-new-chat';
import { useSendMessage } from '@open-webui-react-native/mobile/chat/features/use-send-message';
import {
  imagePickerService,
  ImagePickerSource,
} from '@open-webui-react-native/mobile/shared/data-access/image-picker-service';
import { speechStreamingService } from '@open-webui-react-native/mobile/shared/data-access/speech-streaming-service';
import { useDictateMode } from '@open-webui-react-native/mobile/shared/features/use-dictate-mode';
import { colors, useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';
import {
  AppPressable,
  AppSafeAreaView,
  AppText,
  AppToast,
  IconButton,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ChatGenerationOption, chatApi, isTemporaryChatId } from '@open-webui-react-native/shared/data-access/api';
import { ImageData as ChatImageData } from '@open-webui-react-native/shared/data-access/common';
import { ImageSourceSheet, Loader, SpeechListener } from './components';
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
  const pendingImageRef = useRef<ChatImageData | null>(null);

  const [isVisible, setIsVisible] = useState(false);

  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const [isWaitingNewMessage, setIsWaitingNewMessage] = useState(false);
  const [isReceivingNewMessage, setIsReceivingNewMessage] = useState(false);

  const [chatId, setChatId] = useState<string | undefined>(undefined);
  const [modelId, setModelId] = useState<string>('');

  const chatIdRef = useRef(chatId);
  const modelIdRef = useRef(modelId);
  chatIdRef.current = chatId;
  modelIdRef.current = modelId;

  const handleChatCreated = (id: string): void => {
    if (isVisible) {
      setChatId(id);
      onChatCreated?.(id);
    }
  };

  // NOTE: Temporary chats are never persisted, so there's nothing to fetch — read the client-seeded cache only.
  const { data: chat, isLoading } = chatApi.useGet(chatId as string, {
    enabled: !!chatId && !isTemporaryChatId(chatId),
  });
  const { sendMessage, isLoading: isSending } = useSendMessage({ chatData: chat });
  const { startChatCreation, isLoading: isCreating } = useCreateNewChat({ onSuccess: handleChatCreated });

  const sendMessageRef = useRef(sendMessage);
  const startChatCreationRef = useRef(startChatCreation);
  sendMessageRef.current = sendMessage;
  startChatCreationRef.current = startChatCreation;

  const {
    isRecording,
    isTranscribing,
    startSpeechRecording,
    pauseSpeechRecording,
    stopSpeechRecording,
    completeSpeechRecording,
    metering,
  } = useDictateMode({
    updateIntervalMillis: 100,
    onCompleteRecording: (text: string, language: string) => {
      if (text.trim().length) {
        const attachedImages = pendingImageRef.current ? [pendingImageRef.current] : undefined;
        pendingImageRef.current = null;

        const send = chatIdRef.current ? sendMessageRef.current : startChatCreationRef.current;
        send(text, modelIdRef.current, [ChatGenerationOption.VOICE], undefined, attachedImages);

        speechStreamingService.resumeContentSpeaking(language);
        setIsWaitingNewMessage(true);
      } else {
        startSpeechRecording();
      }
    },
  });

  const newMessage = chat?.chat.history.messages[chat.chat.history.currentId];
  const isThinking =
    isCreating || isSending || isLoading || isTranscribing || isWaitingNewMessage || isReceivingNewMessage;

  const close = async (): Promise<void> => {
    // NOTE: Stop TTS immediately; isStopped is set sync so late handleContent/speakText no-ops
    const stopSpeakingPromise = speechStreamingService.stopContentSpeaking();
    speechStreamingService.clearListeners();
    clearSilenceTimeout();
    pendingImageRef.current = null;
    setIsUserSpeaking(false);
    setIsAiSpeaking(false);
    setIsWaitingNewMessage(false);
    setIsReceivingNewMessage(false);
    setIsVisible(false);
    await stopSpeakingPromise;
    await stopSpeechRecording();
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

  const handlePickImage = async (source: ImagePickerSource): Promise<void> => {
    // NOTE: Pause listening while the system picker is open, the camera can interrupt the audio session
    const shouldResumeListening = isRecording;

    if (shouldResumeListening) {
      clearSilenceTimeout();
      setIsUserSpeaking(false);
      // NOTE: Keep a started phrase for the next message, transcribing silence may produce phantom text
      await pauseSpeechRecording(isUserSpeaking);
    }

    try {
      const image = await imagePickerService.getImage(source);
      const asset = image?.assets?.[0];

      if (asset?.base64) {
        pendingImageRef.current = { uri: asset.uri, base64: asset.base64, mimeType: asset.mimeType };
      }
    } finally {
      if (shouldResumeListening) {
        await startSpeechRecording();
      }
    }
  };

  const handleInterrupt = async (): Promise<void> => {
    setIsAiSpeaking(false);
    setIsWaitingNewMessage(false);
    setIsReceivingNewMessage(false);
    await speechStreamingService.stopContentSpeaking();
    await startSpeechRecording();
  };

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
      void (async () => {
        setIsUserSpeaking(false);
        await completeSpeechRecording();
      })();
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
    if (!isVisible) {
      return;
    }

    if (isWaitingNewMessage && newMessage) {
      if (!newMessage.done) {
        // NOTE: Start receiving a new message via WebSocket
        setIsWaitingNewMessage(false);
        setIsReceivingNewMessage(true);
        speechStreamingService.handleContent(newMessage.content);
      } else if (newMessage.content.trim()) {
        // NOTE: Reply already finished before streaming subscription (common on create-chat)
        setIsWaitingNewMessage(false);
        speechStreamingService.handleContent(newMessage.content, true);
      }
    }

    if (isReceivingNewMessage && newMessage) {
      speechStreamingService.handleContent(newMessage.content, newMessage.done);

      if (newMessage.done) {
        setIsReceivingNewMessage(false);
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
      style={{ overflow: 'hidden', margin: 0 }}
      {...props}>
      <BottomSheetModalProvider>
        <View className='flex-1 bg-background-primary'>
          <AppSafeAreaView edges={['bottom']} className='flex-1'>
            <AppPressable
              onPress={handleInterrupt}
              disabled={!isAiSpeaking}
              className='flex-1 items-center justify-center px-24'>
              {isThinking || isAiSpeaking ? <Loader /> : <SpeechListener metering={metering} />}
            </AppPressable>
            <View className='flex-row justify-between items-center p-24'>
              <ImageSourceSheet onSelectSource={handlePickImage} />
              <AppPressable
                onPress={handleInterrupt}
                disabled={!isAiSpeaking}
                hitSlop={8}>
                <AppText className='text-sm-sm sm:text-sm'>
                  {isAiSpeaking
                    ? translate('TEXT_TAP_TO_INTERRUPT')
                    : isThinking
                      ? translate('TEXT_THINKING')
                      : translate('TEXT_LISTENING')}
                </AppText>
              </AppPressable>
              <IconButton
                iconName='close'
                onPress={close}
                className='w-40 h-40 bg-background-secondary rounded-full' />
            </View>
          </AppSafeAreaView>
        </View>
      </BottomSheetModalProvider>
      <AppToast />
    </Modal>
  );
}
