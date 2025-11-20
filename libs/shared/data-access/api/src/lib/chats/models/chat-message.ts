import { Expose, Type } from 'class-transformer';
import { Role } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';
import { ChatMessageContent } from './chat-message-content';

export class ChatMessage {
  @Expose()
  public role: Role;

  @Expose()
  @Type(() => ChatMessageContent)
  public content: Array<ChatMessageContent>;

  constructor(chatMessage: Partial<ChatMessage>) {
    Object.assign(this, chatMessage);
  }
}
