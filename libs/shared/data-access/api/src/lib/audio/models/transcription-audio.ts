import { Expose } from 'class-transformer';

export class TranscriptionAudio {
  @Expose()
  public text: string;

  @Expose()
  public filename: string;

  constructor(audio: Partial<TranscriptionAudio> = {}) {
    Object.assign(this, audio);
  }
}
