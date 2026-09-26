import { Expose } from 'class-transformer';
import { AttachmentStatus, FileType } from '../../enums';

export class AttachedKnowledgeCollection {
  @Expose()
  public id: string;

  @Expose()
  public type: FileType.COLLECTION;

  @Expose()
  public name: string;

  @Expose()
  public description: string;

  @Expose()
  public status: AttachmentStatus.PROCESSED;

  constructor(attachedKnowledgeCollection: Partial<AttachedKnowledgeCollection>) {
    Object.assign(this, attachedKnowledgeCollection);
  }
}
