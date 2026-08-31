// NOTE: `action` of a `POST /chats/{id}/messages/{messageId}/resolve` request. `ANSWER` is
// accepted only by the built-in `ask_user` call; `APPROVE` is rejected for it.
export enum ToolCallResolveAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  ANSWER = 'answer',
}
