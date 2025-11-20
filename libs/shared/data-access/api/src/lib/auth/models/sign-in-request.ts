import { Expose } from 'class-transformer';

export class SignInRequest {
  @Expose()
  public email: string;

  @Expose()
  public password: string;

  constructor(request: Partial<SignInRequest>) {
    Object.assign(this, request);
  }
}
