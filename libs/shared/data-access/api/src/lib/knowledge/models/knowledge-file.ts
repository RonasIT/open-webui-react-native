import { BaseEntity } from '@ronas-it/rtkq-entity-api';
import { Expose, Type } from 'class-transformer';
import { FileMeta } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';

export class KnowledgeFile extends BaseEntity<string> {
  @Expose()
  @Type(() => FileMeta)
  public meta: FileMeta;

  constructor(file: Partial<KnowledgeFile> = {}) {
    super();
    Object.assign(this, file);
  }
}
