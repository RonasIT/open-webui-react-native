import { Expose, Type } from 'class-transformer';
import { ChatCompletionOutputItem } from './chat-completion-chunk';

export class ResponseStreamResponse {
  @Expose()
  public id?: string;

  @Expose()
  @Type(() => ChatCompletionOutputItem)
  public output?: Array<ChatCompletionOutputItem>;
}

// NOTE: Payload of the `response:completion` socket event (Open WebUI 0.11.1+). It mirrors a
// Responses-API streaming event: `response.output_text.delta`, `response.output_item.added`,
// `response.completed`, etc. Only the fields affecting the visible assistant text are modelled —
// the authoritative full `output` still arrives with the terminal `chat:completion` done event.
export class ResponseStreamEvent {
  @Expose()
  public type?: string;

  @Expose()
  public delta?: string;

  // Index of the item inside the *full* output array. The backend offsets it by the length of the
  // output accumulated before a tool call, so it stays aligned with `chat:completion` snapshots.
  @Expose({ name: 'output_index' })
  public outputIndex?: number;

  @Expose()
  @Type(() => ChatCompletionOutputItem)
  public item?: ChatCompletionOutputItem;

  @Expose()
  @Type(() => ResponseStreamResponse)
  public response?: ResponseStreamResponse;

  constructor(responseStreamEvent: Partial<ResponseStreamEvent> = {}) {
    Object.assign(this, responseStreamEvent);
  }
}
