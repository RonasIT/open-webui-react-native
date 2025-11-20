import { BaseEntity } from '@ronas-it/rtkq-entity-api';
import { Expose, Type } from 'class-transformer';
import { Role } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';
import { Permissions } from './permissions';

export class Profile extends BaseEntity<string> {
  @Expose()
  public email: string;

  @Expose()
  public name: string;

  @Expose()
  public role: Role;

  @Expose({ name: 'profile_image_url' })
  public profileImageUrl: string;

  @Expose()
  @Type(() => Permissions)
  public permissions: Permissions;

  constructor(model: Partial<Profile>) {
    super(model);
    Object.assign(this, model);
  }
}
