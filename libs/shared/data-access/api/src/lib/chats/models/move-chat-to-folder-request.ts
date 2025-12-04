import { Expose } from 'class-transformer';

export class MoveChatToFolderRequest {
  @Expose()
  public id: string;

  @Expose({ name: 'folder_id' })
  public folderId: string | null;

  constructor(request: Partial<MoveChatToFolderRequest> = {}) {
    Object.assign(this, request);
  }
}
