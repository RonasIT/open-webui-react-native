import { Expose, Type } from 'class-transformer';
import { ImageCompression } from './image-compression';

export class FileConfig {
  @Expose({ name: 'max_size' })
  public maxSize: number | null;

  @Expose({ name: 'max_count' })
  public maxCount: number | null;

  @Expose({ name: 'image_compression' })
  @Type(() => ImageCompression)
  public imageCompression: ImageCompression;

  constructor(partial: Partial<FileConfig>) {
    Object.assign(this, partial);
  }
}
