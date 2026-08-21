import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import * as Yup from 'yup';

export class ContactSupportFormSchema {
  public message: string;

  constructor(schema?: Partial<ContactSupportFormSchema>) {
    this.message = schema?.message || '';
  }

  public static get validationSchema(): Yup.ObjectSchema<ContactSupportFormSchema> {
    return Yup.object().shape({
      message: Yup.string().required(i18n.t('SHARED.VALIDATION.TEXT_REQUIRED_MESSAGE')),
    });
  }
}
