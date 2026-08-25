import { Expose } from 'class-transformer';

export class UpdatePasswordRequest {
  @Expose()
  public password: string;

  @Expose({ name: 'new_password' })
  public newPassword: string;

  constructor(request: Partial<UpdatePasswordRequest>) {
    Object.assign(this, request);
  }
}
