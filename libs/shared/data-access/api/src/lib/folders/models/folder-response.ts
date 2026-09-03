import { Expose, Type } from 'class-transformer';
import { AccessGrant } from './access-grant';
import { FolderData } from './folder-data';
import { FolderListItem } from './folder-list-item';
import { FolderMeta } from './folder-meta';

export class FolderResponse extends FolderListItem {
  @Expose({ name: 'user_id' })
  public userId: string;

  @Expose()
  @Type(() => FolderData)
  public data: FolderData;

  @Expose()
  @Type(() => FolderMeta)
  public meta: FolderMeta;

  // NOTE: Only `GET /folders/{id}` and the access-update endpoint return the grants; the folder list does not.
  @Expose({ name: 'access_grants' })
  @Type(() => AccessGrant)
  public accessGrants?: Array<AccessGrant>;

  constructor(data: Partial<FolderResponse>) {
    super(data);
    Object.assign(this, data);
  }
}
