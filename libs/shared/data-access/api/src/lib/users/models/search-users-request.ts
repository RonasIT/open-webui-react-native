import { Expose } from 'class-transformer';

export class SearchUsersRequest {
  @Expose()
  public query?: string;

  @Expose()
  public page: number;

  constructor(request: Partial<SearchUsersRequest> = {}) {
    Object.assign(this, request);
  }
}
