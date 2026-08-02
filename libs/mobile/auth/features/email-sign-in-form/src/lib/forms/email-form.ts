import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import * as Yup from 'yup';
import { emailValidator, serverUrlValidator } from '@open-webui-react-native/mobile/shared/utils/validation';

export class EmailFormSchema {
  public email: string;
  public password: string;
  public url?: string;

  constructor(schema?: Partial<EmailFormSchema>) {
    this.email = schema?.email || '';
    this.password = schema?.password || '';
    this.url = schema?.url || '';
  }

  public static get validationSchema(): Yup.ObjectSchema<EmailFormSchema> {
    return Yup.object().shape({
      email: emailValidator().required(i18n.t('SHARED.VALIDATION.TEXT_REQUIRED_EMAIL')),
      password: Yup.string().required(i18n.t('SHARED.VALIDATION.TEXT_REQUIRED_PASSWORD')),
      url: serverUrlValidator(),
    });
  }
}
