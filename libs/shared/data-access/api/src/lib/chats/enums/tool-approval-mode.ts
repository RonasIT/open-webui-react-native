// NOTE: Open WebUI 0.11.1+ — `params.tool_approval_mode` of a completion request. `ASK` makes the
// backend pause before every tool call and wait for the user; `FULL` keeps the pre-0.11.1 behavior.
export enum ToolApprovalMode {
  FULL = 'full',
  ASK = 'ask',
}
