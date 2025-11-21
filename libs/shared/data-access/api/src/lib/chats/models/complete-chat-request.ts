import { Expose, Type } from 'class-transformer';
import { AttachedFile } from '@open-webui-react-native/shared/data-access/common';
import { BackgroundTasks } from './background-tasks';
import { ChatMessage } from './chat-message';
import { Features } from './features';

export class CompleteChatRequest {
  @Expose()
  public stream: boolean;

  @Expose()
  public model: string;

  @Expose()
  @Type(() => ChatMessage)
  public messages: Array<ChatMessage>;

  @Expose({ name: 'background_tasks' })
  @Type(() => BackgroundTasks)
  public backgroundTasks: BackgroundTasks;

  @Expose()
  @Type(() => Features)
  public features: Features;

  @Expose()
  @Type(() => AttachedFile)
  public files?: Array<AttachedFile>;

  // General chat ID
  @Expose({ name: 'chat_id' })
  public chatId: string;

  // Empty AI Message ID
  @Expose()
  public id: string;

  // Session ID for socket connection
  @Expose({ name: 'session_id' })
  public sessionId: string;

  constructor(request: Partial<CompleteChatRequest> = {}) {
    Object.assign(this, request);
  }
}
