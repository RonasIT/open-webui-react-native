import { BaseEntity } from '@ronas-it/rtkq-entity-api';
import { Expose } from 'class-transformer';
import { UserRole } from '@open-webui-react-native/shared/data-access/common';

export class UserInfo extends BaseEntity<string> {
  @Expose()
  public name: string;

  @Expose()
  public email: string;

  @Expose()
  public role: UserRole;

  @Expose({ name: 'profile_image_url' })
  public profileImageUrl?: string;

  @Expose({ name: 'is_active' })
  public isActive?: boolean;

  constructor(model: Partial<UserInfo>) {
    super(model);
    Object.assign(this, model);
  }
}
