import { Expose } from 'class-transformer';
import { ChatMessageType } from '../types';

export class ChatMessageContent {
  @Expose()
  public type: ChatMessageType;

  @Expose({ name: 'image_url' })
  public imageUrl?: {
    url: string;
  };

  @Expose()
  public text?: string;

  constructor(chatMessageContent: Partial<ChatMessageContent>) {
    Object.assign(this, chatMessageContent);
  }
}
