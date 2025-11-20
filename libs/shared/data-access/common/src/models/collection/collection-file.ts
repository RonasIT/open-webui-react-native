import { BaseEntity } from '@ronas-it/rtkq-entity-api';
import { Expose, Type } from 'class-transformer';
import { FileMeta } from '../files';

export class CollectionFile extends BaseEntity<string> {
  @Expose()
  public name: string;

  @Expose()
  @Type(() => FileMeta)
  public meta: FileMeta;

  constructor(model: Partial<CollectionFile>) {
    super(model);
    Object.assign(this, model);
  }
}
