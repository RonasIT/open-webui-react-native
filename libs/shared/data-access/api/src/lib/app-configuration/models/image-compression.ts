import { Expose } from 'class-transformer';

export class ImageCompression {
  @Expose()
  public width: number | null;

  @Expose()
  public height: number | null;

  constructor(partial: Partial<ImageCompression>) {
    Object.assign(this, partial);
  }
}
