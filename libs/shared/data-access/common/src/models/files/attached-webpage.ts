import { Expose } from 'class-transformer';
import { FileType } from '../../enums';

export class AttachedWebpage {
  @Expose()
  public type: FileType.TEXT;

  @Expose()
  public name: string;

  @Expose({ name: 'collection_name' })
  public collectionName?: string;

  @Expose()
  public status: string;

  @Expose()
  public context: 'full';

  @Expose()
  public url: string;

  @Expose()
  public file: {
    data: { content: string };
    meta: { name: string; source: string };
  };

  constructor(attachedWebpage: Partial<AttachedWebpage>) {
    Object.assign(this, attachedWebpage);
  }
}
