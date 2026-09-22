import { Expose } from 'class-transformer';
import { AttachmentStatus, FileType } from '../../enums';

export class AttachedWebpage {
  @Expose()
  public type: FileType.TEXT;

  @Expose()
  public name: string;

  @Expose({ name: 'collection_name' })
  public collectionName?: string;

  // NOTE: ERROR never leaves the client — the item stays a client-only error chip
  // (see attach-webpage-sheet) and createMessagePair drops it before sending.
  @Expose()
  public status: AttachmentStatus;

  @Expose()
  public context?: 'full';

  @Expose()
  public url: string;

  @Expose()
  public file?: {
    data: { content: string };
    meta: { name: string; source: string };
  };

  constructor(attachedWebpage: Partial<AttachedWebpage>) {
    Object.assign(this, attachedWebpage);
  }
}
