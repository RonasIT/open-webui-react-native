import { Expose } from 'class-transformer';

// NOTE: Only the capabilities the app acts on. A capability the admin never set is absent, which the
// web interface treats as supported when deciding whether to show the matching button.
export class AIModelCapabilities {
  @Expose({ name: 'image_generation' })
  public imageGeneration?: boolean | null;

  @Expose({ name: 'web_search' })
  public webSearch?: boolean | null;
}
