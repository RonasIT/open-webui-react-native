import { Expose, Type } from 'class-transformer';
import { AccessPermission } from '../enums/access-permission';
import { AccessGrant } from './access-grant';
import { FolderListItem } from './folder-list-item';

// NOTE: Shape of `GET /folders/shared` (Open WebUI 0.11.0+) — folders owned by somebody else that
// the current user has access to. Unlike the own-folders list it carries the owner and the granted
// permission, and it never comes with an unread count.
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
