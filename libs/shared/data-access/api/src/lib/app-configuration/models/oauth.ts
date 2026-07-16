import { Expose } from 'class-transformer';
import { Provider } from '../enums';

export class OAuth {
  @Expose()
  public providers: { [key in Provider]?: Provider };

  constructor(partial: Partial<OAuth>) {
    Object.assign(this, partial);
  }
}
