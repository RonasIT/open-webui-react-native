import { getAudioFormData } from '@open-webui-react-native/shared/utils/files';

export const getSpeechFormData = (uri: string, language: string): FormData => {
  const formData = getAudioFormData(uri);
  formData.append('language', language);

  return formData;
};
