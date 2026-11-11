import { Expose } from 'class-transformer';

export class AccessGrantsPermissions {
  @Expose({ name: 'allow_users' })
  public allowUsers: boolean;

  @Expose({ name: 'allow_groups' })
  public allowGroups: boolean;
}
