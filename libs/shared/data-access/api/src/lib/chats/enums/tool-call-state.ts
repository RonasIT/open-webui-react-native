// NOTE: What a tool call looks like to the user. Derived from the raw `ToolCallStatus` of the
// `function_call` item together with the presence of its `function_call_output` — the backend
// marks a call `completed` as soon as its arguments are final, long before the tool answers.
export enum ToolCallState {
  PREPARING = 'preparing',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REJECTED = 'rejected',
}
