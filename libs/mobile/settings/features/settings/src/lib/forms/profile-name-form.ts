import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import * as Yup from 'yup';

const PROFILE_NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s'-]*$/u;

export class ProfileNameFormSchema {
  public name: string;

  constructor(schema?: Partial<ProfileNameFormSchema>) {
    this.name = schema?.name || '';
  }

  public static get validationSchema(): Yup.ObjectSchema<ProfileNameFormSchema> {
    return Yup.object().shape({
      name: Yup.string()
        .trim()
        .required(i18n.t('SHARED.VALIDATION.TEXT_REQUIRED_PROFILE_NAME'))
        .matches(PROFILE_NAME_PATTERN, i18n.t('SHARED.VALIDATION.TEXT_INVALID_PROFILE_NAME')),
    });
  }
}
