import { Expose } from 'class-transformer';

export class StartMfaEnrollmentResponse {
  @Expose({ name: 'manual_key' })
  public manualKey: string;

  @Expose({ name: 'qr_code' })
  public qrCode: string;

  constructor(model: Partial<StartMfaEnrollmentResponse>) {
    Object.assign(this, model);
  }
}
