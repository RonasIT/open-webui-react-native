import { Expose } from 'class-transformer';
import { AttachmentStatus, FileType } from '../../enums';

export class AttachedChat {
  @Expose()
  public id: string;

  @Expose()
  public type: FileType.CHAT;

  @Expose()
  public name: string;

  @Expose()
  public status: AttachmentStatus.PROCESSED;

  constructor(attachedChat: Partial<AttachedChat>) {
    Object.assign(this, attachedChat);
  }
}
