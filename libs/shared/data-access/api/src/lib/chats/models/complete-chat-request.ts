import { Expose, Type } from 'class-transformer';
import { AttachedFile } from '@open-webui-react-native/shared/data-access/common';
import { BackgroundTasks } from './background-tasks';
import { ChatMessage } from './chat-message';
import { CompleteChatParams } from './complete-chat-params';
import { Features } from './features';
import { Message } from './message';

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
  @Type(() => CompleteChatParams)
  public params?: CompleteChatParams;

  @Expose()
  @Type(() => AttachedFile)
  public files?: Array<AttachedFile>;

  // NOTE: The only channel through which tools reach a completion. The backend resolves every kind
  // of tool from this array and never falls back to the model's or the user's defaults, so an
  // omitted field means the model is offered no tools at all. Left `undefined` when nothing is
  // selected, matching the web interface.
  @Expose({ name: 'tool_ids' })
  public toolIds?: Array<string>;

  // General chat ID
  @Expose({ name: 'chat_id' })
  public chatId: string;

  // Empty AI Message ID
  @Expose()
  public id: string;

  // Session ID for socket connection
  @Expose({ name: 'session_id' })
  public sessionId: string;

  // NOTE: Since the backend now owns message persistence, it derives the assistant message's
  // parentId from `user_message`. Without it the backend links the assistant to `null`,
  // orphaning the parent user message. Sent for both new turns and "Continue Response".
  @Expose({ name: 'user_message' })
  @Type(() => Message)
  public userMessage?: Message;

  // parentId of the user message (grandparent link on the backend)
  @Expose({ name: 'parent_id' })
  public parentId?: string | null;

  // Set only for "Continue Response" so the backend keeps the existing assistant message
  // (instead of nulling its parentId) and feeds its prior text back to the model.
  @Expose({ name: 'assistant_message_id' })
  public assistantMessageId?: string;

  constructor(request: Partial<CompleteChatRequest> = {}) {
    Object.assign(this, request);
  }
}
