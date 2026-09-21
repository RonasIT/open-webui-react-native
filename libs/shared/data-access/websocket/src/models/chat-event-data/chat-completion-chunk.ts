import { Expose, Type } from 'class-transformer';
import { MessageSource } from '@open-webui-react-native/shared/data-access/common';
import { ChatCompletionOutputContentPart } from './chat-completion-output-content-part';
import { ChatCompletionOutputFile } from './chat-completion-output-file';

export class ChatCompletionOutputItem {
  @Expose()
  public type?: string;

  // NOTE: These are echoed back to the backend when persisting the assistant message so that
  // "Continue Response" can seed generation from the prior `output` (see handle-completed-chat).
  // Kept faithful to the Responses-API item shape.
  @Expose()
  public id?: string;

  @Expose()
  public role?: string;

  @Expose()
  public status?: string;

  // NOTE: Set on `function_call` items only. `callId` is what identifies the call to the
  // `.../resolve` endpoint, `name`/`toolArguments` are what the approval UI shows the user.
  @Expose({ name: 'call_id' })
  public callId?: string;

  @Expose()
  public name?: string;

  @Expose({ name: 'arguments' })
  public toolArguments?: string;

  @Expose()
  @Type(() => ChatCompletionOutputContentPart)
  public content?: Array<ChatCompletionOutputContentPart>;

  // NOTE: Set on `function_call_output` items only — the tool's own result, as parts of type
  // `input_text` (plus `input_image` parts that exist for the model and carry no user-visible
  // text). Unrelated to the `output` array these items live in.
  @Expose()
  @Type(() => ChatCompletionOutputContentPart)
  public output?: Array<ChatCompletionOutputContentPart>;

  @Expose()
  @Type(() => ChatCompletionOutputFile)
  public files?: Array<ChatCompletionOutputFile>;
}

export class ChatCompletionChunk {
  @Expose()
  public id: string;

  @Expose()
  public content: string;

  @Expose()
  @Type(() => ChatCompletionOutputItem)
  public output?: Array<ChatCompletionOutputItem>;

  @Expose()
  public created?: number;

  @Expose()
  public model?: string;

  @Expose()
  public object?: string;

  @Expose()
  public done?: boolean;

  @Expose()
  public title?: string;

  @Expose()
  @Type(() => MessageSource)
  public sources?: Array<MessageSource>;

  constructor(chatCompletionChunk: Partial<ChatCompletionChunk>) {
    Object.assign(this, chatCompletionChunk);
  }
}
