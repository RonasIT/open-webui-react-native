import { Expose } from 'class-transformer';

export class UiSettings {
  @Expose()
  public version: string;

  @Expose()
  public models: Array<string>;

  @Expose()
  public system?: string;

  // NOTE: Keys below match the Open WebUI web app's own `$settings` store keys 1:1
  // (src/lib/components/chat/Settings/Interface.svelte), so settings stay in sync across clients.
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
