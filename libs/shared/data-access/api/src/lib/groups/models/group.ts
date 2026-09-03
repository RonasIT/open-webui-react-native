import { BaseEntity } from '@ronas-it/rtkq-entity-api';
import { Expose } from 'class-transformer';

export class Group extends BaseEntity<string> {
  @Expose({ name: 'user_id' })
  public userId: string;

  @Expose()
  public name: string;

  @Expose()
  public description: string;

  @Expose({ name: 'member_count' })
  public memberCount?: number;

  constructor(model: Partial<Group>) {
    super(model);
    Object.assign(this, model);
  }
}
