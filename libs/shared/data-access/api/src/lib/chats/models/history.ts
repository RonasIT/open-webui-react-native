import { Expose, Transform } from 'class-transformer';
import { transformRecordValues } from '@open-web-ui-mobile-client-react-native/shared/utils/objects';
import { Message } from './message';

export class History {
  @Expose()
  @Transform(({ value }) => transformRecordValues<Message>(value, Message), { toClassOnly: true })
  public messages: Record<string, Message>;

  @Expose()
  public currentId: string;

  constructor(history: Partial<History> = {}) {
    Object.assign(this, history);
  }
}
