import { Expose } from 'class-transformer';

export class VerifyMfaRequest {
  @Expose({ name: 'challenge_token' })
  public challengeToken: string;

  @Expose()
  public code: string;

  // `code` is a saved recovery code instead of an authenticator code.
  @Expose()
  public recovery: boolean;

  constructor(request: Partial<VerifyMfaRequest>) {
    Object.assign(this, request);
  }
}
