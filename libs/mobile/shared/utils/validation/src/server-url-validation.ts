import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import * as Yup from 'yup';

export const serverUrlValidator = (): Yup.StringSchema =>
  Yup.string()
    .trim()
    .test('server-url', i18n.t('SHARED.VALIDATION.TEXT_INVALID_URL'), (value) => {
      if (!value) {
        return true;
      }

      try {
        const url = new URL(value.trim());

        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          return false;
        }

        if (!url.hostname) {
          return false;
        }

        const normalizedPath = url.pathname.replace(/\/+$/, '/');

        return normalizedPath === '/' && !url.search && !url.hash;
      } catch {
        return false;
      }
    });
