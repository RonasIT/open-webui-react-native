import { useSelector } from '@legendapp/state/react';
import { useEffect, useState } from 'react';
import { useAudioRecorder } from '@open-webui-react-native/mobile/shared/features/use-audio-recorder';
import { audioApi, usersApi } from '@open-webui-react-native/shared/data-access/api';
import { appState$ } from '@open-webui-react-native/shared/data-access/app-state';
import { getAudioFormData } from '@open-webui-react-native/shared/utils/files';
import { normalizeMetering } from './normalize-metering';

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
    onSuccess: (response) => {
      onCompleteRecording?.(response.text, speechLanguage);
    },
  });

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

      const formData = getAudioFormData(uri);
      formData.append('language', speechLanguage);
      transcribeAudio(formData);
    } catch {
      stopSpeechRecording();
    }
  };

  const stopSpeechRecording = async (): Promise<void> => {
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
    stopSpeechRecording,
    metering,
  };
};
