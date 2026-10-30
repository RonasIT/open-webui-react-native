// NOTE: `status` of an item inside a completion's `output` array (Responses API format). Only the
// statuses the client acts on are listed.
export enum ChatCompletionOutputItemStatus {
  COMPLETED = 'completed',
  FAILED = 'failed',
  INCOMPLETE = 'incomplete',
}
