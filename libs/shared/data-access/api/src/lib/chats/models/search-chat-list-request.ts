import { Expose } from 'class-transformer';

export class SearchChatListRequest {
  @Expose()
  public text: string;

  @Expose()
  public page: number;

  constructor(request: Partial<SearchChatListRequest> = {}) {
    Object.assign(this, request);
  }
}
