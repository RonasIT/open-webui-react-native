import { Expose, Type } from 'class-transformer';
import { AccessPermission } from '../enums/access-permission';
import { AccessGrant } from './access-grant';
import { FolderListItem } from './folder-list-item';

export class SharedFolderListItem extends FolderListItem {
  @Expose({ name: 'user_id' })
  public userId: string;

  @Expose({ name: 'owner_name' })
  public ownerName?: string;

  @Expose()
  public permission: AccessPermission;

  @Expose({ name: 'access_grants' })
  @Type(() => AccessGrant)
  public accessGrants?: Array<AccessGrant>;

  constructor(data: Partial<SharedFolderListItem>) {
    super(data);
    Object.assign(this, data);
  }
}
