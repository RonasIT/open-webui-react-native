import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import * as Yup from 'yup';

export class RecoveryFormSchema {
  public resetToken: string;

  constructor(schema?: Partial<RecoveryFormSchema>) {
    this.resetToken = schema?.resetToken || '';
  }

  public static get validationSchema(): Yup.ObjectSchema<RecoveryFormSchema> {
    return Yup.object().shape({
      resetToken: Yup.string().trim().required(i18n.t('AUTH.MFA_RECOVERY.VALIDATION.TEXT_REQUIRED_RECOVERY_TOKEN')),
    });
  }
}
