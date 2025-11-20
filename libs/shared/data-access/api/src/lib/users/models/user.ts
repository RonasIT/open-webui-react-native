import { BaseEntity } from '@ronas-it/rtkq-entity-api';
import { Expose } from 'class-transformer';

export class User extends BaseEntity<string> {
  @Expose()
  public name: string;

  @Expose({ name: 'profile_image_url' })
  public profileImageUrl: string;

  @Expose()
  public active: boolean;

  constructor(model: Partial<User>) {
    super(model);
    Object.assign(this, model);
  }
}
