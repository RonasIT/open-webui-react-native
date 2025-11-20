import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import * as Yup from 'yup';

export const emailValidator = (): Yup.StringSchema =>
  Yup.string().trim().email(i18n.t('SHARED.VALIDATION.TEXT_INVALID_EMAIL'));
