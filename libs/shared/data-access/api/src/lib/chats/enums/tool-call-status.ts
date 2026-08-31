// NOTE: `status` of a `function_call` item inside an assistant message's `output`. Only the
// statuses the client has to react to are listed — a call awaiting the user is `PENDING`
// (`REQUIRES_APPROVAL` is accepted by the backend as an alias).
export enum ToolCallStatus {
  PENDING = 'pending',
  REQUIRES_APPROVAL = 'requires_approval',
  QUEUED = 'queued',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}
