import { Expose } from 'class-transformer';
import { FileMetadata } from '../../types';

export class FileMeta {
  @Expose()
  public name: string;

  @Expose({ name: 'content_type' })
  public contentType: string;

  @Expose()
  public size: number;

  @Expose()
  public data: FileMetadata;

  @Expose({ name: 'collection_name' })
  public collectionName: string;

  constructor(fileMeta: Partial<FileMeta>) {
    Object.assign(this, fileMeta);
  }
}
