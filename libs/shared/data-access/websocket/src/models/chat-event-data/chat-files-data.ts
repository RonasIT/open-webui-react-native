import { Expose } from 'class-transformer';
import { AttachedImage } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';

export class ChatFilesData {
  @Expose()
  public files: Array<AttachedImage>;

  constructor(data: Partial<ChatFilesData>) {
    Object.assign(this, data);
  }
}
