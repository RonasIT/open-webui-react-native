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

  public get lastAssistantMessage(): Message | undefined {
    if (!this.messages) return undefined;

    const assistantMessages = Object.values(this.messages).filter((m) => m.role === 'assistant');

    if (assistantMessages.length === 0) return undefined;

    return assistantMessages.sort((a, b) => b.timestamp - a.timestamp)[0];
  }
}
