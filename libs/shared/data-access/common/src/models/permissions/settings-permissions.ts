import { Expose } from 'class-transformer';

export class SettingsPermissions {
  @Expose()
  public interface: boolean;
}
