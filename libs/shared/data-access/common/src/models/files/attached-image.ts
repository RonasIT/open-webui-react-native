import { Expose } from 'class-transformer';
import { FileType } from '../../enums';

export class AttachedImage {
  // NOTE: Absent on inline images (temporary chats, messages sent before images were uploaded) —
  // those carry the picture itself as a `data:` URL instead of a server file reference.
  @Expose()
  public id?: string;

  @Expose()
  public type: FileType.IMAGE;

  // NOTE: A bare file id for an uploaded image (the web app resolves it to `/api/v1/files/{id}/content`
  // when `content_type` is set), or the picture itself as a `data:` URL for an inline one.
  @Expose()
  public url: string;

  @Expose({ name: 'content_type' })
  public contentType?: string;

  constructor(attachedImage: Partial<AttachedImage> = {}) {
    Object.assign(this, attachedImage);
  }
}
