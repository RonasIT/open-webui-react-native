import { Expose, Type } from 'class-transformer';
import { AudioSettings } from './audio-settings';

export class UiSettings {
  @Expose()
  public version: string;

  @Expose()
  public models: Array<string>;

  @Expose()
  public system?: string;

  @Expose()
  public webSearch?: boolean;

  @Expose()
  public tools?: Array<string>;

  @Expose()
  public enableMessageQueue?: boolean;

  @Expose()
  public chatBubble?: boolean;

  @Expose()
  public temporaryChatByDefault?: boolean;

  @Expose()
  public renderMarkdownInUserMessages?: boolean;

  @Expose()
  @Type(() => AudioSettings)
  public audio?: AudioSettings;

  constructor(response: Partial<UiSettings>) {
    Object.assign(this, response);
  }
}
