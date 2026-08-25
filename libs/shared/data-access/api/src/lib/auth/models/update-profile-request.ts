import { Expose } from 'class-transformer';

export class UpdateProfileRequest {
  @Expose()
  public name: string;

  @Expose({ name: 'profile_image_url' })
  public profileImageUrl: string;

  constructor(request: Partial<UpdateProfileRequest>) {
    Object.assign(this, request);
  }
}
