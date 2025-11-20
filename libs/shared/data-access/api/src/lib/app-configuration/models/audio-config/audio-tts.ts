import { Expose } from 'class-transformer';

export class AudioTTS {
  @Expose()
  public engine: string;

  @Expose()
  public voice: string;

  @Expose({ name: 'split_on' })
  public splitOn: string;

  constructor(partial: Partial<AudioTTS>) {
    Object.assign(this, partial);
  }
}
