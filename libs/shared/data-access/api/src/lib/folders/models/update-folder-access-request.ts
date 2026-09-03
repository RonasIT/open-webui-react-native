import { Expose, Type } from 'class-transformer';
import { AccessGrant } from './access-grant';

export class UpdateFolderAccessRequest {
  @Expose()
  public id: string;

  @Expose({ name: 'access_grants' })
  @Type(() => AccessGrant)
  public accessGrants: Array<AccessGrant>;

  constructor(request: Partial<UpdateFolderAccessRequest>) {
    Object.assign(this, request);
  }
}
