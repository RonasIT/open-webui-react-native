import * as Yup from 'yup';
import { serverUrlValidator } from '@open-webui-react-native/mobile/shared/utils/validation';

export class ConnectFormSchema {
  public url: string;

  constructor(schema?: Partial<ConnectFormSchema>) {
    this.url = schema?.url || '';
  }

  public static get validationSchema(): Yup.ObjectSchema<ConnectFormSchema> {
    return Yup.object().shape({
      url: serverUrlValidator().defined(),
    });
  }
}
