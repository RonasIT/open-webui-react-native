import { Expose } from 'class-transformer';
import { Profile } from './profile';

export class SignInResponse extends Profile {
  @Expose()
  public token: string;

  @Expose({ name: 'token_type' })
  public tokenType: string;

  @Expose({ name: 'expires_at' })
  public expiresAt: number;

  constructor(request: Partial<SignInResponse>) {
    super(request);
    Object.assign(this, request);
  }
}
