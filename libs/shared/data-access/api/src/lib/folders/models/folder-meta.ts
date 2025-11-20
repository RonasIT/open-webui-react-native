import { Expose } from 'class-transformer';

export class FolderMeta {
  @Expose({ name: 'background_image_url' })
  public background_image_url: string;

  constructor(meta: Partial<FolderMeta>) {
    Object.assign(this, meta);
  }
}
