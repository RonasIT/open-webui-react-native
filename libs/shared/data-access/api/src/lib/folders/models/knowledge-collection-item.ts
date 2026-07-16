import { Expose } from 'class-transformer';
import { FileType } from '@open-webui-react-native/shared/data-access/common';
import { Knowledge } from '../../knowledge/models/knowledge';

export class KnowledgeCollectionItem extends Knowledge {
  @Expose()
  public type: FileType.COLLECTION;

  constructor(data: Partial<KnowledgeCollectionItem> = {}) {
    super(data);
    // Must be assigned in the constructor body: babel emits the bare field declaration
    // as defineProperty(this, 'type', undefined) which runs after super() and wipes it
    this.type = FileType.COLLECTION;
  }
}
