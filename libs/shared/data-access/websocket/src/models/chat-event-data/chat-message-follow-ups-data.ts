import { Expose } from 'class-transformer';

export class ChatMessageFollowUpsData {
  @Expose({ name: 'follow_ups' })
  public followUps: Array<string>;

  constructor(data: Partial<ChatMessageFollowUpsData>) {
    Object.assign(this, data);
  }
}
