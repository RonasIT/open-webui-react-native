import { Expose, Type } from 'class-transformer';
import { SttSettings } from './stt-settings';

export class AudioSettings {
  @Expose()
  @Type(() => SttSettings)
  public stt?: SttSettings;

  constructor(response: Partial<AudioSettings>) {
    Object.assign(this, response);
  }
}
