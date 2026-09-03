import { Expose, Type } from 'class-transformer';
import { ChatListItem } from '../../chats/models/chat-list-item';

export class SharedFolderChatsResponse {
  @Expose()
  @Type(() => ChatListItem)
  public chats: Array<ChatListItem>;

  @Expose({ name: 'folder_permission' })
  public folderPermission: 'read' | 'write';

  @Expose({ name: 'has_more' })
  public hasMore?: boolean;

  @Expose()
  public total?: number;

  constructor(response: Partial<SharedFolderChatsResponse> = {}) {
    Object.assign(this, response);
  }
}
