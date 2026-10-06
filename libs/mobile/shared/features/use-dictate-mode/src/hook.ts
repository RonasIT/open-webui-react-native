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
}

export interface UseDictateModeResult {
  durationMillis: number;
  isRecording: boolean;
  isTranscribing: boolean;
  startSpeechRecording: () => Promise<void>;
  completeSpeechRecording: () => Promise<void>;
  pauseSpeechRecording: (shouldKeepSpeech: boolean) => Promise<void>;
  stopSpeechRecording: () => Promise<void>;
  metering?: number;
}

export const useDictateMode = ({
  onCompleteRecording,
  onStartRecording,
  onStopRecording,
  updateIntervalMillis = 400,
}: UseDictateModeArgs): UseDictateModeResult => {
  const { recorder, startRecording, isReady, stopRecording } = useAudioRecorder();
  const locale = useSelector(appState$.locale);
  const { data: userSettings } = usersApi.useGetUserSettings();

  // NOTE: Without a language the server guesses it per phrase and may switch to wrong language
  const speechLanguage = userSettings?.ui?.audio?.stt?.language || locale;

  // NOTE: Speech cut off by pauseSpeechRecording, prepended to the next completed recording
  const pausedSpeechRef = useRef<Promise<string> | null>(null);

  const [isRecording, setIsRecording] = useState<boolean>(false);
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
      setDurationMillis(durationMillis);
      setMetering(normalizeMetering(metering));
    }, updateIntervalMillis);

    return () => clearInterval(interval);
  }, [isRecording, isReady]);

  const { mutate: transcribeAudio, isPending: isTranscribing } = audioApi.useTranscribeAudio({
    onSuccess: async (response) => {
      const pausedText = await pausedSpeechRef.current;
      pausedSpeechRef.current = null;
      onCompleteRecording?.(joinString([pausedText, response.text]), speechLanguage);
    },
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

      transcribeAudio(getSpeechFormData(uri, speechLanguage));
    } catch {
      stopSpeechRecording();
    }
  };

  const pauseSpeechRecording = async (shouldKeepSpeech: boolean): Promise<void> => {
    setIsRecording(false);
    const uri = await stopRecording();

    if (shouldKeepSpeech && uri) {
      pausedSpeechRef.current = transcribePausedSpeech(uri, pausedSpeechRef.current);
    }
  };

  const stopSpeechRecording = async (): Promise<void> => {
    pausedSpeechRef.current = null;
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
    metering,
  };
};
