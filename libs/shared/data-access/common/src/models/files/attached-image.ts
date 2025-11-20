import { Expose } from 'class-transformer';
import { FileType } from '../../enums';

export class AttachedImage {
  @Expose()
  public type: FileType.IMAGE;

  @Expose()
  public url: string;

  constructor(attachedImage: Partial<AttachedImage> = {}) {
    Object.assign(this, attachedImage);
  }
}
