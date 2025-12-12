import { Expose, Transform } from 'class-transformer';
import { Role } from '@open-webui-react-native/shared/data-access/common';
import { transformRecordValues } from '@open-webui-react-native/shared/utils/objects';
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
    if (!this.messages || !this.currentId) return undefined;

    let current = this.messages[this.currentId];
    if (!current) return undefined;

    // Walk up through parents until we reach the start of the conversation
    while (current) {
      if (current.role === Role.ASSISTANT) {
        return current;
      }

      if (!current.parentId) break;
      current = this.messages[current.parentId];
    }

    return undefined;
  }
}
