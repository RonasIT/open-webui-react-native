import { Expose } from 'class-transformer';

export class GetChatListRequest {
  @Expose()
  public page: number;

  @Expose({ name: 'include_folders' })
  public includeFolders?: boolean;

  @Expose({ name: 'include_pinned' })
  public includePinned?: boolean;

  constructor(request: Partial<GetChatListRequest> = {}) {
    Object.assign(this, request);
  }
}
