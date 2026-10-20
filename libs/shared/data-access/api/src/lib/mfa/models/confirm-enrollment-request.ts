import { Expose } from 'class-transformer';

export class ConfirmMfaEnrollmentRequest {
  @Expose({ name: 'challenge_token' })
  public challengeToken: string;

  @Expose()
  public code: string;

  constructor(request: Partial<ConfirmMfaEnrollmentRequest>) {
    Object.assign(this, request);
  }
}
