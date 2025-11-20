import { BaseEntity } from '@ronas-it/rtkq-entity-api';
import { Expose, Transform, Type } from 'class-transformer';
import dayjs, { Dayjs } from 'dayjs';

export class FolderListItem extends BaseEntity<string> {
  @Expose({ name: 'parent_id' })
  public parentId: string;

  @Expose()
  public name: string;

  @Expose({ name: 'is_expanded' })
  public isExpanded: boolean;

  @Expose({ name: 'updated_at' })
  @Type(() => Dayjs)
  @Transform(({ value }) => dayjs.unix(value))
  public updatedAt: Dayjs;

  @Expose({ name: 'created_at' })
  @Type(() => Dayjs)
  @Transform(({ value }) => dayjs.unix(value))
  public createdAt: Dayjs;

  constructor(data: Partial<FolderListItem>) {
    super();
    Object.assign(this, data);
  }
}
