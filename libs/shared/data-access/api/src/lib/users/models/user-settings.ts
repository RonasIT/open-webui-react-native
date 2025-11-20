import { Expose, Type } from 'class-transformer';
import { UiSettings } from './ui-settings';

export class UserSettings {
  @Expose()
  @Type(() => UiSettings)
  public ui: UiSettings;

  constructor(response: Partial<UserSettings>) {
    Object.assign(this, response);
  }
}
