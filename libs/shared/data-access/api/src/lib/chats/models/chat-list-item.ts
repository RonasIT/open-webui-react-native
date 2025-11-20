import { Expose, Type, Transform } from 'class-transformer';
import dayjs, { Dayjs } from 'dayjs';

export class ChatListItem {
  @Expose()
  public id: string;

  @Expose()
  public title: string;

  @Expose({ name: 'updated_at' })
  @Type(() => Dayjs)
  @Transform(({ value }) => dayjs.unix(value))
  public updatedAt: Dayjs;

  @Expose({ name: 'created_at' })
  @Type(() => Dayjs)
  @Transform(({ value }) => dayjs.unix(value))
  public createdAt: Dayjs;

  constructor(response: Partial<ChatListItem> = {}) {
    Object.assign(this, response);
  }
}
