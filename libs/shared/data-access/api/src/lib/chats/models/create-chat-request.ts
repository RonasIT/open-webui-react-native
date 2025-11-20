import { Expose, Type } from 'class-transformer';
import { Chat } from './chat';

export class CreateNewChatRequest {
  @Expose()
  @Type(() => Chat)
  public chat: Chat;

  @Expose({ name: 'folder_id' })
  public folderId: string;

  constructor(request: Partial<CreateNewChatRequest> = {}) {
    Object.assign(this, request);
  }
}
