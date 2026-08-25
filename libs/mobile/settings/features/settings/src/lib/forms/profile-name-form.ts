import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import * as Yup from 'yup';

export class ProfileNameFormSchema {
  public name: string;

  constructor(schema?: Partial<ProfileNameFormSchema>) {
    this.name = schema?.name || '';
  }

  public static get validationSchema(): Yup.ObjectSchema<ProfileNameFormSchema> {
    return Yup.object().shape({
      name: Yup.string().trim().required(i18n.t('SHARED.VALIDATION.TEXT_REQUIRED_PROFILE_NAME')),
    });
  }
}
