import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import * as Yup from 'yup';

export class AuthenticatorSetupFormSchema {
  public code: string;

  constructor(schema?: Partial<AuthenticatorSetupFormSchema>) {
    this.code = schema?.code || '';
  }

  public static get validationSchema(): Yup.ObjectSchema<AuthenticatorSetupFormSchema> {
    return Yup.object().shape({
      code: Yup.string().trim().required(i18n.t('AUTH.MFA_AUTHENTICATOR_SETUP.VALIDATION.TEXT_REQUIRED_CODE')),
    });
  }
}
