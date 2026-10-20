import { Expose } from 'class-transformer';

export class RecoverMfaRequest {
  @Expose({ name: 'challenge_token' })
  public challengeToken: string;

  @Expose({ name: 'reset_token' })
  public resetToken: string;

  constructor(request: Partial<RecoverMfaRequest>) {
    Object.assign(this, request);
  }
}
