import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

export const showOfflineToast = (): void => ToastService.show(i18n.t('SHARED.COMMON.TEXT_DISABLED_IN_OFFLINE_MODE'));
