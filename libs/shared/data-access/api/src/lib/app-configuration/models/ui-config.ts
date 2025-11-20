import { Expose } from 'class-transformer';

export class UIConfig {
  @Expose({ name: 'pending_user_overlay_title' })
  public pendingUserOverlayTitle: string;

  @Expose({ name: 'pending_user_overlay_content' })
  public pendingUserOverlayContent: string;

  @Expose({ name: 'response_watermark' })
  public responseWatermark: string;

  constructor(partial: Partial<UIConfig>) {
    Object.assign(this, partial);
  }
}
