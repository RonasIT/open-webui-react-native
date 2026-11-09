import { Expose } from 'class-transformer';

export class UpdateProfileRequest {
  @Expose()
  public name: string;

  @Expose({ name: 'profile_image_url' })
  public profileImageUrl: string;

  @Expose()
  public bio?: string | null;

  @Expose()
  public gender?: string | null;

  @Expose({ name: 'date_of_birth' })
  public dateOfBirth?: string | null;

  constructor(request: Partial<UpdateProfileRequest>) {
    Object.assign(this, request);
  }
}
