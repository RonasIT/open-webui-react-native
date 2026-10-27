import { Expose } from 'class-transformer';

export class SttSettings {
  @Expose()
  public language?: string;

  constructor(response: Partial<SttSettings>) {
    Object.assign(this, response);
  }
}
