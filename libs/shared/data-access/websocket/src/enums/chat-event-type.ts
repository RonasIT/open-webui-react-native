export enum ChatEventType {
  COMPLETION = 'chat:completion',
  // NOTE: Since Open WebUI 0.11.1 the assistant text streams as incremental Responses-API delta
  // events under this type instead of full snapshots under `chat:completion`. Older backends
  // never emit it, so both event types are handled side by side.
  RESPONSE_COMPLETION = 'response:completion',
  // NOTE: Sent instead of a terminal `chat:completion` when the provider request fails.
  MESSAGE_ERROR = 'chat:message:error',
  TITLE = 'chat:title',
  STATUS = 'status',
  FILES = 'files',
  MESSAGE_FOLLOW_UPS = 'chat:message:follow_ups',
}
