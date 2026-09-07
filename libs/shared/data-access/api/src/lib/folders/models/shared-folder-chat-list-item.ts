import { Expose } from 'class-transformer';
import { ChatListItem } from '../../chats/models/chat-list-item';

// NOTE: `GET /folders/{id}/shared/chats` flags every chat of the folder created by somebody else as
// readonly. Only the endpoints of a shared folder report it, so it is absent from a plain chat list.
export class SharedFolderChatListItem extends ChatListItem {
  @Expose({ name: 'readonly' })
  public isReadonly?: boolean;

  constructor(response: Partial<SharedFolderChatListItem> = {}) {
    super(response);
    Object.assign(this, response);
  }
}
