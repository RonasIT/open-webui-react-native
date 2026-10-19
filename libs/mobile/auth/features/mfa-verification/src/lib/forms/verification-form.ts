import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import * as Yup from 'yup';

export class VerificationFormSchema {
  public code: string;

  constructor(schema?: Partial<VerificationFormSchema>) {
    this.code = schema?.code || '';
  }

  public static get validationSchema(): Yup.ObjectSchema<VerificationFormSchema> {
    return Yup.object().shape({
      code: Yup.string().trim().required(i18n.t('AUTH.MFA_VERIFICATION.VALIDATION.TEXT_REQUIRED_CODE')),
    });
  }
}
