import { Expose } from 'class-transformer';
import { AccessPermission } from '../enums/access-permission';
import { PrincipalType } from '../enums/principal-type';

export class AccessGrant {
  @Expose()
  public id?: string;

  @Expose({ name: 'principal_type' })
  public principalType: PrincipalType;

  @Expose({ name: 'principal_id' })
  public principalId: string;

  @Expose()
  public permission: AccessPermission;

  constructor(grant: Partial<AccessGrant> = {}) {
    Object.assign(this, grant);
  }
}
