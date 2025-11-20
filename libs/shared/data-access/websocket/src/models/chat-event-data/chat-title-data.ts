import { Expose } from 'class-transformer';
import { ChatEventType } from '../../enums';

export class ChatTitleData {
  @Expose()
  public type: ChatEventType;

  @Expose()
  public data: string;

  constructor(chatTitleData: Partial<ChatTitleData>) {
    Object.assign(this, chatTitleData);
  }
}
