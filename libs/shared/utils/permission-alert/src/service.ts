import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { Alert, Linking } from 'react-native';
import { ToastService } from '@open-web-ui-mobile-client-react-native/shared/utils/toast-service';

class PermissionAlertService {
  public showAlert = (title: string, message: string): void => {
    const alertOptions = [
      {
        text: i18n.t('SHARED.COMMON.BUTTON_CANCEL'),
      },
      {
        text: i18n.t('SHARED.COMMON.BUTTON_OPEN_SETTINGS'),
        onPress: () => {
          try {
            Linking.openSettings();
          } catch {
            ToastService.showError(i18n.t('SHARED.COMMON.TEXT_UNABLE_TO_OPEN_SETTINGS'));
          }
        },
      },
    ];

    Alert.alert(title || i18n.t('SHARED.COMMON.TEXT_SETTINGS'), message, alertOptions);
  };
}

export const permissionAlertService = new PermissionAlertService();
