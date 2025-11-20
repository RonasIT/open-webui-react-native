import { Expose, Type } from 'class-transformer';
import { SourceType } from '../../enums';
import { CollectionFile } from './collection-file';

export class Collection {
  @Expose()
  public id: string;

  @Expose()
  public type: SourceType.COLLECTION;

  @Expose()
  @Type(() => CollectionFile)
  public files: Array<CollectionFile>;

  @Expose()
  public name: string;

  @Expose()
  public error: string;

  constructor(attachedFile: Partial<Collection>) {
    Object.assign(this, attachedFile);
  }
}
