import { Expose } from 'class-transformer';
import { ModelControlChoices } from '../../ai-models/models/model-control-choices';
import { ToolApprovalMode } from '../enums';

// NOTE: `params` of a completion request. The backend reads `tool_approval_mode` and `model_controls`
// from here and ignores the chat's stored params, so they have to be sent with every completion.
export class CompleteChatParams {
  @Expose({ name: 'tool_approval_mode' })
  public toolApprovalMode?: ToolApprovalMode;

  @Expose({ name: 'model_controls' })
  public modelControls?: Record<string, ModelControlChoices>;

  constructor(params: Partial<CompleteChatParams> = {}) {
    Object.assign(this, params);
  }
}
