import { Expose } from 'class-transformer';

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
  public enableMessageQueue?: boolean;

  @Expose()
  public chatBubble?: boolean;

  @Expose()
  public temporaryChatByDefault?: boolean;

  @Expose()
  public renderMarkdownInUserMessages?: boolean;

  constructor(response: Partial<UiSettings>) {
    Object.assign(this, response);
  }
}
