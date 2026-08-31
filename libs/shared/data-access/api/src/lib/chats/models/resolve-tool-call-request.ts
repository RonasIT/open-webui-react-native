import { Expose } from 'class-transformer';
import { ToolCallResolveAction } from '../enums';

// NOTE: Body of `POST /chats/{chatId}/messages/{messageId}/resolve` (Open WebUI 0.11.1+). The
// endpoint writes the tool result into the message `output` and restarts generation itself, so the
// answer keeps streaming into the same assistant message over the socket.
export class ResolveToolCallRequest {
  @Expose({ name: 'call_id' })
  public callId: string;

  @Expose()
  public action: ToolCallResolveAction;

  // Only the built-in `ask_user` call accepts answers; a plain tool call is rejected with 400.
  @Expose()
  public answers?: Record<string, unknown>;

  @Expose({ name: 'timed_out' })
  public timedOut?: boolean;

  constructor(request: Partial<ResolveToolCallRequest> = {}) {
    Object.assign(this, request);
  }
}
