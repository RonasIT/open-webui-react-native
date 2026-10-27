import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { useAudioRecorder as useExpoAudioRecorder, AudioRecorder, AudioModule } from 'expo-audio';
import { useRef, useState } from 'react';
import { permissionAlertService } from '@open-webui-react-native/shared/utils/permission-alert';
import { recordingOptions } from './config';

export interface UseAudioRecorderResult {
  recorder: AudioRecorder;
  isReady: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null | undefined>;
}

export const useAudioRecorder = (): UseAudioRecorderResult => {
  const recorder = useExpoAudioRecorder(recordingOptions);
  const stopPromiseRef = useRef<Promise<string | null | undefined> | null>(null);
  const [isReady, setIsReady] = useState(false);

  const startRecording = async (): Promise<void> => {
    // NOTE: The recorder reports isRecording until stop finishes, so a start during it would be skipped
    try {
      await stopPromiseRef.current;
    } catch {
      // NOTE: The stop's caller handles its error
    }

    if (recorder.isRecording) {
      return;
    }

    const permission = await AudioModule.requestRecordingPermissionsAsync();

    if (permission.status === 'granted') {
      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();

      setIsReady(false);
      //NOTE: Android native-level MediaRecorder needs ~100–150ms to warm up
      setTimeout(() => setIsReady(true), 150);
    } else {
      permissionAlertService.showAlert(
        i18n.t('SHARED.USE_AUDIO_RECORDER.TEXT_NO_ACCESS'),
        i18n.t('SHARED.USE_AUDIO_RECORDER.TEXT_APP_NEEDS_ACCESS'),
      );
      throw new Error();
    }
  };

  const stopRecorder = async (): Promise<string | null | undefined> => {
    if (!recorder.isRecording) {
      return;
    }

    await recorder.stop();
    await AudioModule.setAudioModeAsync({
      allowsRecording: false,
    });

    setIsReady(false);

    return recorder.uri;
  };

  const stopRecording = async (): Promise<string | null | undefined> => {
    if (!stopPromiseRef.current) {
      stopPromiseRef.current = stopRecorder();
    }

    try {
      return await stopPromiseRef.current;
    } finally {
      stopPromiseRef.current = null;
    }
  };

  return {
    recorder,
    isReady,
    startRecording,
    stopRecording,
  };
};
