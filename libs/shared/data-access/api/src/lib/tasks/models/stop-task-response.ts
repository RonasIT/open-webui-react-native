import { Expose } from 'class-transformer';

export class StopTaskResponse {
  @Expose()
  public message: string;

  @Expose()
  public status: boolean;

  constructor(data: Partial<StopTaskResponse>) {
    Object.assign(this, data);
  }
}
