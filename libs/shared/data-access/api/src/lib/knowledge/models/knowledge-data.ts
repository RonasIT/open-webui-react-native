import { Expose } from 'class-transformer';

export class KnowledgeData {
  @Expose({ name: 'file_ids' })
  public fileIds: Array<string>;

  constructor(data: Partial<KnowledgeData> = {}) {
    Object.assign(this, data);
  }
}
