import { Expose } from 'class-transformer';

export class MessageSourceMetadata {
  @Expose({ name: 'embedding_config' })
  public embeddingConfig: string;

  @Expose({ name: 'file_id' })
  public fileId: string;

  @Expose()
  public hash: string;

  @Expose()
  public name: string;

  @Expose()
  public source: string;

  @Expose({ name: 'start_index' })
  public startIndex: number;

  @Expose({ name: 'created_by' })
  public createdBy?: string;

  constructor(metadata: Partial<MessageSourceMetadata>) {
    Object.assign(this, metadata);
  }
}
