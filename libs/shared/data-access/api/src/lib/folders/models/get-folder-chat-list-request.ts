import { Expose } from 'class-transformer';

export class GetFolderChatListRequest {
  @Expose({ name: 'folder_id' })
  public folderId: string;

  @Expose()
  public page: number;

  constructor(request: Partial<GetFolderChatListRequest> = {}) {
    Object.assign(this, request);
  }
}
