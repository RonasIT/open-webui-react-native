import { Expose } from 'class-transformer';
import { Message } from './message';

export class CompletedChat {
  @Expose({ name: 'chat_id' })
  public chatId: string;

  @Expose()
  public id: string;

  @Expose()
  public messages: Array<Partial<Message>>;

  @Expose()
  public model: string;

  @Expose({ name: 'session_id' })
  public sessionId: string;

  constructor(completedChat: Partial<CompletedChat> = {}) {
    Object.assign(this, completedChat);
  }
}
