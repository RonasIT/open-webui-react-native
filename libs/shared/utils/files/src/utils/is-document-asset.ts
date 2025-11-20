import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export function isDocumentAsset(
  asset: DocumentPicker.DocumentPickerAsset | ImagePicker.ImagePickerAsset,
): asset is DocumentPicker.DocumentPickerAsset {
  return 'name' in asset;
}
