import { Expose } from 'class-transformer';

// TODO: Clarify correct type
export class OAuthProviders {}

export class OAuth {
  @Expose()
  public providers: OAuthProviders;

  constructor(partial: Partial<OAuth>) {
    Object.assign(this, partial);
  }
}
