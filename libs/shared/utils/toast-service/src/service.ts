import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import Toast from 'react-native-toast-message';

export class ToastService {
  public static showFeatureNotImplemented(): void {
    Toast.show({
      type: 'info',
      position: 'top',
      topOffset: 32,
      visibilityTime: 1000,
      text1: i18n.t('SHARED.COMMON.TEXT_FEATURE_NOT_IMPLEMENTED_YET'),
    });
  }

  public static showError(message?: string): void {
    Toast.show({
      type: 'error',
      position: 'top',
      topOffset: 32,
      visibilityTime: 2000,
      text1: message || i18n.t('SHARED.API_ERRORS.TEXT_SOMETHING_WENT_WRONG'),
    });
  }

  public static showSuccess(message?: string): void {
    Toast.show({
      type: 'success',
      position: 'top',
      topOffset: 32,
      visibilityTime: 2000,
      text1: message,
    });
  }

  public static show(message: string): void {
    Toast.show({
      type: 'info',
      position: 'top',
      topOffset: 32,
      visibilityTime: 2000,
      text1: message,
    });
  }

  public static hide(): void {
    Toast.hide();
  }
}
