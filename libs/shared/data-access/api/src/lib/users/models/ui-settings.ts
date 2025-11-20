import { Expose } from 'class-transformer';

export class UiSettings {
  @Expose()
  public version: string;

  @Expose()
  public models: Array<string>;

  constructor(response: Partial<UiSettings>) {
    Object.assign(this, response);
  }
}
