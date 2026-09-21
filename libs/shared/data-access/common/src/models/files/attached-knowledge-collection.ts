import { Expose } from 'class-transformer';
import { FileType } from '../../enums';

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
  public status: string;

  constructor(attachedKnowledgeCollection: Partial<AttachedKnowledgeCollection>) {
    Object.assign(this, attachedKnowledgeCollection);
  }
}
