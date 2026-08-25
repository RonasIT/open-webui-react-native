import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import * as Yup from 'yup';

export class ChangePasswordFormSchema {
  public currentPassword: string;
  public newPassword: string;
  public confirmPassword: string;

  constructor(schema?: Partial<ChangePasswordFormSchema>) {
    this.currentPassword = schema?.currentPassword || '';
    this.newPassword = schema?.newPassword || '';
    this.confirmPassword = schema?.confirmPassword || '';
  }

  public static get validationSchema(): Yup.ObjectSchema<ChangePasswordFormSchema> {
    return Yup.object().shape({
      currentPassword: Yup.string().required(i18n.t('SHARED.VALIDATION.TEXT_REQUIRED_CURRENT_PASSWORD')),
      newPassword: Yup.string()
        .required(i18n.t('SHARED.VALIDATION.TEXT_REQUIRED_NEW_PASSWORD'))
        .min(8, i18n.t('SHARED.VALIDATION.TEXT_PASSWORD_TOO_SHORT')),
      confirmPassword: Yup.string()
        .required(i18n.t('SHARED.VALIDATION.TEXT_REQUIRED_CONFIRM_PASSWORD'))
        .oneOf([Yup.ref('newPassword')], i18n.t('SHARED.VALIDATION.TEXT_PASSWORDS_DO_NOT_MATCH')),
    });
  }
}
