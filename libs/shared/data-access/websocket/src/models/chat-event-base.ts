import { Expose, Type } from 'class-transformer';
import { ChatEventData } from './chat-event-data/chat-event-data';

export class ChatEventBase<T = unknown> {
  @Expose({ name: 'chat_id' })
  public chatId: string;

  @Expose({ name: 'message_id' })
  public messageId: string;

  @Expose()
  @Type(() => ChatEventData)
  public data: ChatEventData<T>;

  constructor(chatEvent: Partial<ChatEventBase>) {
    Object.assign(this, chatEvent);
  }
}
