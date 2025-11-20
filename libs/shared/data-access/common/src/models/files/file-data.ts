import { Expose, Transform, Type } from 'class-transformer';
import { FileDataContent } from '../../types';
import { FileMeta } from './file-meta';

export class FileData {
  @Expose()
  public id: string;

  @Expose({ name: 'user_id' })
  public userId: string;

  @Expose()
  public hash: string;

  @Expose()
  @Transform(({ value }) => decodeURIComponent(value), { toClassOnly: true })
  public filename: string;

  @Expose({ name: 'collection_name' })
  public collectionName: string;

  @Expose()
  public data: FileDataContent;

  @Expose()
  @Type(() => FileMeta)
  public meta: FileMeta;

  @Expose({ name: 'updated_at' })
  public updatedAt: number;

  @Expose({ name: 'created_at' })
  public createdAt: number;

  constructor(fileData: Partial<FileData>) {
    Object.assign(this, fileData);
  }
}
