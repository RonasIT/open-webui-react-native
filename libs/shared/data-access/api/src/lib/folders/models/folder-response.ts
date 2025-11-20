import { Expose, Type } from 'class-transformer';
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

  constructor(data: Partial<FolderResponse>) {
    super(data);
    Object.assign(this, data);
  }
}
