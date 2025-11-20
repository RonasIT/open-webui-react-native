import { Expose } from 'class-transformer';

export class GoogleSignInRequest {
  @Expose()
  public email: string;

  @Expose({ name: 'is_production' })
  public isProduction?: boolean;

  constructor(request: Partial<GoogleSignInRequest>) {
    Object.assign(this, request);
  }
}
