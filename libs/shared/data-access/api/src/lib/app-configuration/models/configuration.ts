import { Expose, Type } from 'class-transformer';
import { AudioConfig } from './audio-config';
import { CodeConfig } from './code-config';
import { Features } from './features';
import { FileConfig } from './file-config';
import { GoogleDriveConfig } from './google-drive-config';
import { OAuth } from './oauth';
import { OneDriveConfig } from './one-drive-config';
import { Permissions } from './permissions';
import { PromptSuggestion } from './prompt-suggestion';
import { UIConfig } from './ui-config';

export class Configuration {
  @Expose()
  public status: boolean;

  @Expose()
  public name: string;

  @Expose()
  public version: string;

  @Expose({ name: 'default_locale' })
  public defaultLocale: string;

  @Expose()
  @Type(() => OAuth)
  public oauth: OAuth;

  @Expose()
  @Type(() => Features)
  public features: Features;

  @Expose({ name: 'default_models' })
  public defaultModels: string;

  @Expose({ name: 'default_prompt_suggestions' })
  @Type(() => PromptSuggestion)
  public defaultPromptSuggestions: Array<PromptSuggestion>;

  @Expose({ name: 'user_count' })
  public userCount: number;

  @Expose()
  @Type(() => CodeConfig)
  public code: CodeConfig;

  @Expose()
  @Type(() => AudioConfig)
  public audio: AudioConfig;

  @Expose()
  @Type(() => FileConfig)
  public file: FileConfig;

  @Expose()
  @Type(() => Permissions)
  public permissions: Permissions;

  @Expose({ name: 'google_drive' })
  @Type(() => GoogleDriveConfig)
  public googleDrive: GoogleDriveConfig;

  @Expose({ name: 'onedrive' })
  @Type(() => OneDriveConfig)
  public onedrive: OneDriveConfig;

  @Expose()
  @Type(() => UIConfig)
  public ui: UIConfig;

  @Expose({ name: 'license_metadata' })
  public licenseMetadata: any | null;

  @Expose({ name: 'active_entries' })
  public activeEntries: any | null;

  constructor(partial: Partial<Configuration>) {
    Object.assign(this, partial);
  }
}
