import { Expose } from 'class-transformer';
import { ToolApprovalMode } from '../enums';

// NOTE: `params` of a completion request. The backend reads `tool_approval_mode` from here and
// ignores the chat's stored params, so it has to be sent with every completion.
export class CompleteChatParams {
  @Expose({ name: 'tool_approval_mode' })
  public toolApprovalMode?: ToolApprovalMode;

  constructor(params: Partial<CompleteChatParams> = {}) {
    Object.assign(this, params);
  }
}
