import { Expose } from 'class-transformer';

export class GetChatListRequest {
  @Expose()
  public page: number;

  constructor(request: Partial<GetChatListRequest> = {}) {
    Object.assign(this, request);
  }
}
