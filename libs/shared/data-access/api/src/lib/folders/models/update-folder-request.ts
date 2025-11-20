import { Expose, Type } from 'class-transformer';
import { FolderData } from './folder-data';

export class UpdateFolderRequest {
  @Expose()
  public id: string;

  @Expose()
  public name: string;

  @Expose()
  @Type(() => FolderData)
  public data: FolderData;

  constructor(request: Partial<UpdateFolderRequest>) {
    Object.assign(this, request);
  }
}
