import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { isDocumentAsset } from './is-document-asset';

export const getDocumentFormData = (
  asset: DocumentPicker.DocumentPickerAsset | ImagePicker.ImagePickerAsset,
  fieldName = 'file',
): FormData => {
  const formData = new FormData();

  if (isDocumentAsset(asset)) {
    const { uri, mimeType: type, name } = asset;
    formData.append(fieldName, { uri, type, name } as any);
  } else {
    const { uri } = asset;
    const match = /\.(\w+)$/.exec(uri);
    const type = match ? `image/${match[1]}` : 'image';

    formData.append(fieldName, { uri, type, name: match?.[1] } as any);
  }

  return formData;
};

export const getAudioFormData = (uri: string, name: string = 'file'): FormData => {
  const formData = new FormData();

  const fileUri = Platform.OS === 'android' ? `file://${uri}` : uri;
  const match = /\.(\w+)$/.exec(uri);
  const type = match ? `audio/${match[1]}` : 'audio';

  formData.append(name, { uri: fileUri, type, name: match?.[1] } as any);

  return formData;
};
