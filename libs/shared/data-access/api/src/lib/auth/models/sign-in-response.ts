import { Expose } from 'class-transformer';
import { MfaNextStep } from '../../mfa/enums';
import { Profile } from './profile';

export class SignInResponse extends Profile {
  @Expose()
  public token: string;

  @Expose({ name: 'token_type' })
  public tokenType: string;

  @Expose({ name: 'expires_at' })
  public expiresAt: number;

  // MFA step (Open WebUI >= 0.12.0): returned instead of `token` when MFA is required.
  @Expose({ name: 'next_step' })
  public nextStep?: MfaNextStep;

  @Expose({ name: 'challenge_token' })
  public challengeToken?: string;

  @Expose({ name: 'expires_in' })
  public expiresIn?: number;

  // Returned once, after the authenticator is set up.
  @Expose({ name: 'recovery_codes' })
  public recoveryCodes?: Array<string>;

  constructor(request: Partial<SignInResponse>) {
    super(request);
    Object.assign(this, request);
  }
}
