import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import * as Yup from 'yup';
import { emailValidator } from '@open-web-ui-mobile-client-react-native/mobile/shared/utils/validation';

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
      url: Yup.string()
        .url(i18n.t('SHARED.VALIDATION.TEXT_INVALID_URL'))
        .test('no-path', i18n.t('SHARED.VALIDATION.TEXT_INVALID_URL'), (value) => {
          if (!value) return true;
          if (value.endsWith('/')) return false;

          try {
            const url = new URL(value);

            return url.pathname === '/' && !url.search && !url.hash;
          } catch {
            return false;
          }
        }),
    });
  }
}
