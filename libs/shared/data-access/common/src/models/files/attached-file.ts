import { Expose, Transform, Type } from 'class-transformer';
import { FileType } from '../../enums';
import { FileData } from './file-data';

export class AttachedFile {
  @Expose()
  public id: string;

  @Expose()
  public type: FileType.FILE;

  @Expose()
  @Type(() => FileData)
  public file: FileData;

  @Expose()
  public url: string;

  @Expose()
  @Transform(({ value }) => decodeURIComponent(value), { toClassOnly: true })
  public name: string;

  @Expose({ name: 'collection_name' })
  public collectionName: string;

  @Expose()
  public status: string;

  @Expose()
  public size: number;

  @Expose()
  public error: string;

  @Expose()
  public itemId: string;

  constructor(attachedFile: Partial<AttachedFile>) {
    Object.assign(this, attachedFile);
  }
}
