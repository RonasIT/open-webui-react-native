import { BaseEntity } from '@ronas-it/rtkq-entity-api';
import { Expose, Type, Transform, Exclude } from 'class-transformer';
import dayjs, { Dayjs } from 'dayjs';
import { Chat } from './chat';

export class ChatResponse extends BaseEntity<string> {
  @Expose({ name: 'user_id' })
  public userId: string;

  @Expose()
  public title: string;

  @Expose()
  @Type(() => Chat)
  public chat: Chat;

  @Expose({ name: 'updated_at' })
  @Type(() => Dayjs)
  @Transform(({ value }) => dayjs.unix(value))
  public updatedAt: Dayjs;

  @Expose({ name: 'created_at' })
  @Type(() => Dayjs)
  @Transform(({ value }) => dayjs.unix(value))
  public createdAt: Dayjs;

  @Expose({ name: 'share_id' })
  public shareId?: string | null;

  @Expose()
  public archived: boolean;

  @Expose()
  public pinned: boolean;

  @Expose()
  public meta: Record<string, any>;

  @Expose({ name: 'folder_id' })
  public folderId?: string | null;

  constructor(response: Partial<ChatResponse> = {}) {
    super();
    Object.assign(this, response);
  }
}
