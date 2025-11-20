import { Expose } from 'class-transformer';
import { ChatEventType } from '../../enums';

export class ChatEventData<T = unknown> {
  @Expose()
  public type: ChatEventType;

  @Expose()
  public data: T;

  constructor(chatEventData: Partial<ChatEventData>) {
    Object.assign(this, chatEventData);
  }
}
