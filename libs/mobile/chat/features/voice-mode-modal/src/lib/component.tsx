import { i18n, useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { CameraType, useCameraPermissions } from 'expo-camera';
import { ForwardedRef, ReactElement, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Modal, { ModalProps } from 'react-native-modal';
import { useCreateNewChat } from '@open-webui-react-native/mobile/chat/features/use-create-new-chat';
import { useSendMessage } from '@open-webui-react-native/mobile/chat/features/use-send-message';
import { speechStreamingService } from '@open-webui-react-native/mobile/shared/data-access/speech-streaming-service';
import { useDictateMode } from '@open-webui-react-native/mobile/shared/features/use-dictate-mode';
import { colors, useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';
import { AppSafeAreaView, AppText, AppToast, IconButton, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { chatApi } from '@open-webui-react-native/shared/data-access/api';
import { ImageData as ChatImageData } from '@open-webui-react-native/shared/data-access/common';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { CameraPreview, CameraPreviewMethods, Loader, SpeechListener } from './components';
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
  const [, requestCameraPermission] = useCameraPermissions();

  const silenceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cameraPreviewRef = useRef<CameraPreviewMethods>(null);
  const pendingImageRef = useRef<ChatImageData | null>(null);
  const isCameraOnRef = useRef(false);

  const [isVisible, setIsVisible] = useState(false);

  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const [isWaitingNewMessage, setIsWaitingNewMessage] = useState(false);
  const [isReceivingNewMessage, setIsReceivingNewMessage] = useState(false);

  const [chatId, setChatId] = useState<string | undefined>(undefined);
  const [modelId, setModelId] = useState<string>('');

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<CameraType>('front');

  const chatIdRef = useRef(chatId);
  const modelIdRef = useRef(modelId);
  chatIdRef.current = chatId;
  modelIdRef.current = modelId;
  isCameraOnRef.current = isCameraOn;

  const handleChatCreated = (id: string): void => {
    if (isVisible) {
      setChatId(id);
      onChatCreated?.(id);
    }
  };

  const { data: chat, isLoading } = chatApi.useGet(chatId as string, { enabled: !!chatId });
  const { sendMessage, isLoading: isSending } = useSendMessage({ chatData: chat });
  const { startChatCreation, isLoading: isCreating } = useCreateNewChat({ onSuccess: handleChatCreated });

  const sendMessageRef = useRef(sendMessage);
  const startChatCreationRef = useRef(startChatCreation);
  sendMessageRef.current = sendMessage;
  startChatCreationRef.current = startChatCreation;

  const { isTranscribing, startSpeechRecording, stopSpeechRecording, completeSpeechRecording, metering } =
    useDictateMode({
      updateIntervalMillis: 100,
      onCompleteRecording: (text: string) => {
        const attachedImages = pendingImageRef.current ? [pendingImageRef.current] : undefined;
        pendingImageRef.current = null;

        if (text.trim().length) {
          if (chatIdRef.current) {
            sendMessageRef.current(text, modelIdRef.current, undefined, undefined, attachedImages);
          } else {
            startChatCreationRef.current(text, modelIdRef.current, undefined, undefined, attachedImages);
          }

          speechStreamingService.resumeContentSpeaking();
          setIsWaitingNewMessage(true);
        } else {
          startSpeechRecording();
        }
      },
    });

  const newMessage = chat?.chat.history.messages[chat.chat.history.currentId];
  const isThinking =
    isCreating || isSending || isLoading || isTranscribing || isWaitingNewMessage || isReceivingNewMessage;

  const stopCamera = (): void => {
    setIsCameraOn(false);
  };

  const close = async (): Promise<void> => {
    // NOTE: Stop TTS immediately; isStopped is set sync so late handleContent/speakText no-ops
    const stopSpeakingPromise = speechStreamingService.stopContentSpeaking();
    speechStreamingService.clearListeners();
    clearSilenceTimeout();
    stopCamera();
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

  const startCamera = async (): Promise<void> => {
    const permission = await requestCameraPermission();

    if (!permission.granted) {
      ToastService.showError(i18n.t('SHARED.IMAGE_PICKER_SERVICE.TEXT_ACCESS_DENIED'));

      return;
    }

    setIsCameraOn(true);
  };

  const flipCameraFacing = (): void => {
    setCameraFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const capturePendingImage = async (): Promise<void> => {
    if (!isCameraOnRef.current) {
      pendingImageRef.current = null;

      return;
    }

    pendingImageRef.current = (await cameraPreviewRef.current?.takePicture()) ?? null;
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
        await capturePendingImage();
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
      <View className='flex-1 bg-background-primary'>
        <AppSafeAreaView edges={['bottom']} className='flex-1'>
          <View className='flex-1 items-center justify-center px-24'>
            {isCameraOn ? (
              <View className='w-full items-center justify-center'>
                <CameraPreview
                  ref={cameraPreviewRef}
                  facing={cameraFacing}
                  onClose={stopCamera} />
                {(isThinking || isAiSpeaking) && (
                  <View className='absolute inset-0 items-center justify-center'>
                    <Loader />
                  </View>
                )}
              </View>
            ) : isThinking || isAiSpeaking ? (
              <Loader />
            ) : (
              <SpeechListener metering={metering} />
            )}
          </View>
          <View className='flex-row justify-between items-center p-24'>
            <IconButton
              iconName={isCameraOn ? 'refresh' : 'camera'}
              onPress={isCameraOn ? flipCameraFacing : startCamera}
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
      </View>
      <AppToast />
    </Modal>
  );
}
