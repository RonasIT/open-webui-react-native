import { Expose } from 'class-transformer';
import { FileType } from '@open-webui-react-native/shared/data-access/common';
import { Knowledge } from '../../knowledge/models/knowledge';

export class KnowledgeCollectionItem extends Knowledge {
  @Expose()
  public type: FileType.COLLECTION;

  constructor(data: Partial<KnowledgeCollectionItem> = {}) {
    super(data);
  }
}
