// NOTE: The query retries this and then pauses while offline, which is the pending state of a chat the cache does not have.
export class OfflineChatMissingError extends Error {
  constructor() {
    super('Chat is not in the local database');
    this.name = 'OfflineChatMissingError';
  }
}
