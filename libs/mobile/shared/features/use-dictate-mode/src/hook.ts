import { useSelector } from '@legendapp/state/react';
import { useEffect, useRef, useState } from 'react';
import { useAudioRecorder } from '@open-webui-react-native/mobile/shared/features/use-audio-recorder';
import { audioApi, usersApi } from '@open-webui-react-native/shared/data-access/api';
import { appState$ } from '@open-webui-react-native/shared/data-access/app-state';
import { joinString } from '@open-webui-react-native/shared/utils/strings';
import { normalizeMetering } from './normalize-metering';
import { getSpeechFormData } from './utils';

export interface UseDictateModeArgs {
  onCompleteRecording?: (text: string, language: string) => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  updateIntervalMillis?: number;
  // NOTE: A recording that never gets louder isn't transcribed; omit to always transcribe
  speechThreshold?: number;
}

export interface UseDictateModeResult {
  durationMillis: number;
  isRecording: boolean;
  isTranscribing: boolean;
  startSpeechRecording: () => Promise<void>;
  completeSpeechRecording: () => Promise<void>;
  pauseSpeechRecording: () => Promise<void>;
  stopSpeechRecording: () => Promise<void>;
  hasPausedSpeech: boolean;
  metering?: number;
}

export const useDictateMode = ({
  onCompleteRecording,
  onStartRecording,
  onStopRecording,
  updateIntervalMillis = 400,
  speechThreshold,
}: UseDictateModeArgs): UseDictateModeResult => {
  const { recorder, startRecording, isReady, stopRecording } = useAudioRecorder();
  const locale = useSelector(appState$.locale);
  const { data: userSettings } = usersApi.useGetUserSettings();

  // NOTE: Without a language the server guesses it per phrase and may switch to wrong language
  const speechLanguage = userSettings?.ui?.audio?.stt?.language || locale;

  // NOTE: Speech cut off by pauseSpeechRecording, prepended to the next completed recording
  const pausedSpeechRef = useRef<Promise<string> | null>(null);
  const hasSpeechRef = useRef(false);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [hasPausedSpeech, setHasPausedSpeech] = useState(false);
  const [metering, setMetering] = useState<number | undefined>(undefined);
  const [durationMillis, setDurationMillis] = useState<number>(0);

  useEffect(() => {
    if (!isRecording || !isReady) {
      setDurationMillis(0);
      setMetering(undefined);

      return;
    }

    const interval = setInterval(() => {
      const { durationMillis, metering } = recorder.getStatus();
      const normalizedMetering = normalizeMetering(metering);

      if (speechThreshold !== undefined && normalizedMetering > speechThreshold) {
        hasSpeechRef.current = true;
      }

      setDurationMillis(durationMillis);
      setMetering(normalizedMetering);
    }, updateIntervalMillis);

    return () => clearInterval(interval);
  }, [isRecording, isReady]);

  const hasSpeech = (): boolean => speechThreshold === undefined || hasSpeechRef.current;

  const clearPausedSpeech = (): void => {
    pausedSpeechRef.current = null;
    setHasPausedSpeech(false);
  };

  const finishRecording = async (text?: string): Promise<void> => {
    const pausedSpeech = pausedSpeechRef.current;
    clearPausedSpeech();
    onCompleteRecording?.(joinString([await pausedSpeech, text]), speechLanguage);
  };

  const { mutate: transcribeAudio, isPending: isTranscribing } = audioApi.useTranscribeAudio({
    onSuccess: (response) => finishRecording(response.text),
  });
  // NOTE: Separate mutation so background transcription of paused speech isn't reported as isTranscribing
  const { mutateAsync: transcribePausedAudio } = audioApi.useTranscribeAudio();

  const transcribePausedSpeech = async (uri: string, previousSpeech: Promise<string> | null): Promise<string> => {
    try {
      const { text } = await transcribePausedAudio(getSpeechFormData(uri, speechLanguage));

      return joinString([await previousSpeech, text]);
    } catch {
      // NOTE: A failed fragment shouldn't block the next phrase
      return joinString([await previousSpeech]);
    }
  };

  const startSpeechRecording = async (): Promise<void> => {
    await startRecording();
    hasSpeechRef.current = false;
    setIsRecording(true);
    onStartRecording?.();
  };

  const completeSpeechRecording = async (): Promise<void> => {
    if (!isRecording) {
      return;
    }
    setIsRecording(false);

    try {
      const uri = await stopRecording();

      if (!uri) {
        return;
      }

      // NOTE: Skip transcribing silence, it may produce phantom text
      if (hasSpeech()) {
        transcribeAudio(getSpeechFormData(uri, speechLanguage));
      } else {
        await finishRecording();
      }
    } catch {
      stopSpeechRecording();
    }
  };

  const pauseSpeechRecording = async (): Promise<void> => {
    setIsRecording(false);
    const uri = await stopRecording();

    if (uri && hasSpeech()) {
      pausedSpeechRef.current = transcribePausedSpeech(uri, pausedSpeechRef.current);
      setHasPausedSpeech(true);
    }
  };

  const stopSpeechRecording = async (): Promise<void> => {
    clearPausedSpeech();
    setIsRecording(false);
    await stopRecording();
    onStopRecording?.();
  };

  return {
    durationMillis,
    isRecording,
    isTranscribing,
    startSpeechRecording,
    completeSpeechRecording,
    pauseSpeechRecording,
    stopSpeechRecording,
    hasPausedSpeech,
    metering: isRecording ? metering : undefined,
  };
};
