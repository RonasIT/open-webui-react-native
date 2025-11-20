import { Expose, Type } from 'class-transformer';
import { FolderData } from './folder-data';

export class CreateFolderRequest {
  @Expose()
  public name: string;

  @Expose()
  @Type(() => FolderData)
  public data: FolderData;

  constructor(request: Partial<CreateFolderRequest>) {
    Object.assign(this, request);
  }
}
