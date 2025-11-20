import { Expose, Type } from 'class-transformer';
import { AudioSTT } from './audio-sst';
import { AudioTTS } from './audio-tts';

export class AudioConfig {
  @Expose()
  @Type(() => AudioTTS)
  public tts: AudioTTS;

  @Expose()
  @Type(() => AudioSTT)
  public stt: AudioSTT;

  constructor(partial: Partial<AudioConfig>) {
    Object.assign(this, partial);
  }
}
