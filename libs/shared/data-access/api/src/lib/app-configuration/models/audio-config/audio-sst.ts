import { Expose } from 'class-transformer';

export class AudioSTT {
  @Expose()
  public engine: string;

  constructor(partial: Partial<AudioSTT>) {
    Object.assign(this, partial);
  }
}
