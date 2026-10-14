import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import * as Yup from 'yup';

// One field for every MFA step: authenticator code, recovery code or recovery token.
export class MfaCodeFormSchema {
  public code: string;

  constructor(schema?: Partial<MfaCodeFormSchema>) {
    this.code = schema?.code || '';
  }

  public static get validationSchema(): Yup.ObjectSchema<MfaCodeFormSchema> {
    return Yup.object().shape({
      code: Yup.string().trim().required(i18n.t('AUTH.MFA_FORM.VALIDATION.TEXT_REQUIRED_CODE')),
    });
  }
}
