import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { ImagePickerSource } from './enums';

export class ImagePickerService {
  public defaultOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: 'images',
    allowsEditing: false,
    base64: true,
    quality: 0.2,
  };

  public getImage(source: ImagePickerSource): Promise<ImagePicker.ImagePickerResult | null> {
    return this.pickImage(source);
  }

  private requestGalleryAccess(): Promise<ImagePicker.PermissionResponse> {
    return ImagePicker.requestMediaLibraryPermissionsAsync();
  }

  private launchGallery(): Promise<ImagePicker.ImagePickerResult> {
    return ImagePicker.launchImageLibraryAsync(this.defaultOptions);
  }

  private requestCameraAccess(): Promise<ImagePicker.PermissionResponse> {
    return ImagePicker.requestCameraPermissionsAsync();
  }

  private launchCamera(): Promise<ImagePicker.ImagePickerResult> {
    return ImagePicker.launchCameraAsync(this.defaultOptions);
  }

  private async pickImage(source: ImagePickerSource): Promise<ImagePicker.ImagePickerResult | null> {
    const isCamera = source === ImagePickerSource.CAMERA;

    const response = isCamera ? await this.requestCameraAccess() : await this.requestGalleryAccess();

    if (response.status === 'denied' && !(Platform.OS === 'android' && response.canAskAgain)) {
      ToastService.showError(i18n.t('SHARED.IMAGE_PICKER_SERVICE.TEXT_ACCESS_DENIED'));

      return null;
    }

    return isCamera ? this.launchCamera() : this.launchGallery();
  }
}

export const imagePickerService = new ImagePickerService();
