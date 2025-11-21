import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { useAudioRecorder as useExpoAudioRecorder, AudioRecorder, AudioModule } from 'expo-audio';
import { permissionAlertService } from '@open-webui-react-native/shared/utils/permission-alert';
import { recordingOptions } from './config';

export interface UseAudioRecorderResult {
  recorder: AudioRecorder;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null | undefined>;
}

export const useAudioRecorder = (): UseAudioRecorderResult => {
  const recorder = useExpoAudioRecorder(recordingOptions);

  const startRecording = async (): Promise<void> => {
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
    } else {
      permissionAlertService.showAlert(
        i18n.t('SHARED.USE_AUDIO_RECORDER.TEXT_NO_ACCESS'),
        i18n.t('SHARED.USE_AUDIO_RECORDER.TEXT_APP_NEEDS_ACCESS'),
      );
      throw new Error();
    }
  };

  const stopRecording = async (): Promise<string | null | undefined> => {
    if (!recorder.isRecording) {
      return;
    }

    await recorder.stop();
    await AudioModule.setAudioModeAsync({
      allowsRecording: false,
    });
    const uri = recorder.uri;

    return uri;
  };

  return {
    recorder,
    startRecording,
    stopRecording,
  };
};
