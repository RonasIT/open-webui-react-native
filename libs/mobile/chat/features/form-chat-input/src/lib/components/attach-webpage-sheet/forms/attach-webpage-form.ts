import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import * as Yup from 'yup';
import { parseWebpageUrls } from '@open-webui-react-native/shared/data-access/api';

export class AttachWebpageFormSchema {
  public url: string;

  constructor(schema?: Partial<AttachWebpageFormSchema>) {
    this.url = schema?.url || '';
  }

  public static get validationSchema(): Yup.ObjectSchema<AttachWebpageFormSchema> {
    return Yup.object().shape({
      url: Yup.string()
        .trim()
        .required(i18n.t('CHAT.FORM_CHAT_INPUT.ATTACH_WEBPAGE_SHEET.TEXT_INVALID_URL'))
        .test(
          'http-urls',
          i18n.t('CHAT.FORM_CHAT_INPUT.ATTACH_WEBPAGE_SHEET.TEXT_INVALID_URL'),
          (value) => parseWebpageUrls(value ?? '').length > 0,
        ),
    });
  }
}
