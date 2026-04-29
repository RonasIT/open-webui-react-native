import { Expose } from 'class-transformer';

export class GoogleSignInRequest {
  @Expose()
  public email: string;

  constructor(request: Partial<GoogleSignInRequest>) {
    Object.assign(this, request);
  }
}
