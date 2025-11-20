import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import * as Yup from 'yup';

export class UpsertFolderFormSchema {
  public name: string;
  public systemPrompt?: string;

  constructor(schema?: Partial<UpsertFolderFormSchema>) {
    this.name = schema?.name || '';
    this.systemPrompt = schema?.systemPrompt;
  }

  public static get validationSchema(): Yup.ObjectSchema<UpsertFolderFormSchema> {
    return Yup.object().shape({
      name: Yup.string().required(i18n.t('SHARED.VALIDATION.TEXT_REQUIRED_FOLDER_NAME')),
      systemPrompt: Yup.string(),
    });
  }
}
