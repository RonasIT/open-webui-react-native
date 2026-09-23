import { Expose } from 'class-transformer';

export class ProcessUrlRequest {
  @Expose()
  public url: string;

  @Expose({ name: 'collection_name' })
  public collectionName?: string | null;

  constructor(request: Partial<ProcessUrlRequest>) {
    Object.assign(this, request);
  }
}
