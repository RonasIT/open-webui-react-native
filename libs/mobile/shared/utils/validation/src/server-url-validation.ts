import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import * as Yup from 'yup';
import { normalizeServerUrl } from '@open-webui-react-native/shared/utils/config';

export const serverUrlValidator = (): Yup.StringSchema =>
  Yup.string()
    .trim()
    .test('server-url', i18n.t('SHARED.VALIDATION.TEXT_INVALID_URL'), (value) => {
      if (!value) {
        return true;
      }

      try {
        const normalizedUrl = normalizeServerUrl(value);

        if (!/^https?:\/\//i.test(normalizedUrl)) {
          return false;
        }

        const url = new URL(normalizedUrl);

        if (!url.hostname) {
          return false;
        }

        return url.pathname === '/' && !url.search && !url.hash;
      } catch {
        return false;
      }
    });
