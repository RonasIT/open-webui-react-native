import { Expose, Type } from 'class-transformer';
import { UserInfo } from './user-info';

export class SearchUsersResponse {
  @Expose()
  @Type(() => UserInfo)
  public users: Array<UserInfo>;

  @Expose()
  public total: number;

  constructor(response: Partial<SearchUsersResponse> = {}) {
    Object.assign(this, response);
  }
}
