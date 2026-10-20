import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { Linking } from 'react-native';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

// NOTE: Model links may use schemes nothing can open (`sandbox:`), and iOS rejects them even in canOpenURL.
export const openLink = (href: string): Promise<void> =>
  Linking.openURL(href).catch(() => ToastService.showError(i18n.t('SHARED.COMMON.TEXT_UNABLE_TO_OPEN_LINK')));
