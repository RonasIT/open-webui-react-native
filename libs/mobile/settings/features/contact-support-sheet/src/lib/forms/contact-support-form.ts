import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import * as Yup from 'yup';
import { emailValidator } from '@open-webui-react-native/mobile/shared/utils/validation';

export class ContactSupportFormSchema {
  public email: string;
  public message: string;

  constructor(schema?: Partial<ContactSupportFormSchema>) {
    this.email = schema?.email || '';
    this.message = schema?.message || '';
  }

  public static get validationSchema(): Yup.ObjectSchema<ContactSupportFormSchema> {
    return Yup.object().shape({
      email: emailValidator().required(i18n.t('SHARED.VALIDATION.TEXT_REQUIRED_EMAIL')),
      message: Yup.string().required(i18n.t('SHARED.VALIDATION.TEXT_REQUIRED_MESSAGE')),
    });
  }
}
