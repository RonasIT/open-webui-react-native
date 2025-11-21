import { useEffect, useState } from 'react';
import { useAudioRecorder } from '@open-webui-react-native/mobile/shared/features/use-audio-recorder';
import { audioApi } from '@open-webui-react-native/shared/data-access/api';
import { getAudioFormData } from '@open-webui-react-native/shared/utils/files';
import { normalizeMetering } from './normalize-metering';

export interface UseDictateModeArgs {
  onCompleteRecording?: (text: string) => void;
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
  const { recorder, startRecording, stopRecording } = useAudioRecorder();

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [metering, setMetering] = useState<number | undefined>(undefined);
  const [durationMillis, setDurationMillis] = useState<number>(0);

  useEffect(() => {
    const recorderStateInterval =
      isRecording &&
      setInterval(() => {
        const { durationMillis, metering } = recorder.getStatus();
        setDurationMillis(durationMillis);
        setMetering(normalizeMetering(metering));
      }, updateIntervalMillis);

    if (!isRecording && recorderStateInterval) {
      setDurationMillis(0);
      setMetering(undefined);
      clearInterval(recorderStateInterval);
    }

    return () => {
      if (recorderStateInterval) {
        clearInterval(recorderStateInterval);
      }
    };
  }, [isRecording]);

  const { mutate: transcribeAudio, isPending: isTranscribing } = audioApi.useTranscribeAudio({
    onSuccess: (response) => {
      onCompleteRecording?.(response.text);
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

    try {
      const uri = await stopRecording();
      setIsRecording(false);

      if (!uri) {
        return;
      }

      const formData = getAudioFormData(uri);
      transcribeAudio(formData);
    } catch {
      stopSpeechRecording();
    }
  };

  const stopSpeechRecording = async (): Promise<void> => {
    await stopRecording();
    setIsRecording(false);
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
