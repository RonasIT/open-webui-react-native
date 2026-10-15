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

  @Expose({ name: 'next_step' })
  public nextStep?: MfaNextStep;

  @Expose({ name: 'challenge_token' })
  public challengeToken?: string;

  @Expose({ name: 'recovery_codes' })
  public recoveryCodes?: Array<string>;

  constructor(request: Partial<SignInResponse>) {
    super(request);
    Object.assign(this, request);
  }
}
