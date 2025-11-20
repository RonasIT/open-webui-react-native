import { Expose } from 'class-transformer';

export class ChatStatusData {
  @Expose()
  public description: string;

  @Expose()
  public done: boolean;

  constructor(data: Partial<ChatStatusData>) {
    Object.assign(this, data);
  }
}
