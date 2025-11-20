import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { compact } from 'lodash';
import { Alert, AlertButton, AlertOptions, Platform } from 'react-native';

class AlertService {
  public show({ title, message }: { title: string; message?: string }): void {
    if (Platform.OS === 'web') {
      alert(message);
    } else {
      Alert.alert(title, message);
    }
  }

  public confirm({
    title,
    message,
    onConfirm,
    onCancel,
    cancelButtonText,
    confirmButtonText,
    confirmButtonStyle,
    options,
    cancelButtonShown = true,
  }: {
    title: string;
    message?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    cancelButtonText?: string;
    confirmButtonText?: string;
    confirmButtonStyle?: AlertButton['style'];
    options?: AlertOptions;
    cancelButtonShown?: boolean;
  }): void {
    Alert.alert(
      title,
      message,
      compact([
        cancelButtonShown && {
          text: cancelButtonText || i18n.t('SHARED.COMMON.BUTTON_CANCEL'),
          onPress: onCancel,
          style: 'cancel',
        },
        {
          text: confirmButtonText || i18n.t('SHARED.COMMON.BUTTON_CONFIRM'),
          onPress: onConfirm,
          style: confirmButtonStyle,
        },
      ]),
      options,
    );
  }
}

export const alertService = new AlertService();
