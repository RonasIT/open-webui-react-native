import { Expose, Type } from 'class-transformer';
import { SharedFolderChatListItem } from './shared-folder-chat-list-item';

export class SharedFolderChatsResponse {
  @Expose()
  @Type(() => SharedFolderChatListItem)
  public chats: Array<SharedFolderChatListItem>;

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
