import { Expose } from 'class-transformer';
import { FileType } from '../../enums';

export class AttachedImage {
  // NOTE: Absent on inline images (temporary chats, messages sent before images were uploaded) —
  // those carry the picture itself as a `data:` URL instead of a server file reference.
  @Expose()
  public id?: string;

  @Expose()
  public type: FileType.IMAGE;

  // NOTE: Despite the name, this is not always a link. What it holds depends on how the image was sent:
  // - Uploaded to the server (regular chats): the id of the uploaded file, e.g. `a1b2c3…`. The web
  //   app stores images the same way. The backend uses this id to load the picture for the model and
  //   to let tools like `edit_image` work on it. To display the image, build the link
  //   `/api/v1/files/{id}/content` from it (see `getAttachedImageUrl`).
  // - Not uploaded (temporary chats, voice mode, no `chat.file_upload` permission, older messages):
  //   the picture itself, encoded as a `data:image/...;base64,...` string. It can be displayed as is,
  //   but tools cannot use it.
  @Expose()
  public url: string;

  @Expose({ name: 'content_type' })
  public contentType?: string;

  constructor(attachedImage: Partial<AttachedImage> = {}) {
    Object.assign(this, attachedImage);
  }
}
