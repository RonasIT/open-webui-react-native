import { Expose, Type } from 'class-transformer';

export class ChatMessageError {
  @Expose()
  public content?: string;

  constructor(error: Partial<ChatMessageError> = {}) {
    Object.assign(this, error);
  }
}

// NOTE: Payload of the `chat:message:error` socket event. It is the *only* signal the backend sends
// when a provider request fails — no terminal `chat:completion` with `done` follows it, so the
// client has to finish the message itself or it stays in the generating state forever.
export class ChatMessageErrorData {
  @Expose()
  @Type(() => ChatMessageError)
  public error?: ChatMessageError;

  constructor(data: Partial<ChatMessageErrorData> = {}) {
    Object.assign(this, data);
  }
}
