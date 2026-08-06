import { Expose, Type } from 'class-transformer';
import { MessageSource } from '@open-webui-react-native/shared/data-access/common';

// NOTE: Since Open WebUI 0.11.0 the completion stream delivers assistant text inside an
// `output` array (Responses API format) instead of a flat `content` string. Each `message`
// item carries `content` parts of type `output_text`.
export class ChatCompletionOutputContentPart {
  @Expose()
  public type?: string;

  @Expose()
  public text?: string;
}

export class ChatCompletionOutputItem {
  @Expose()
  public type?: string;

  @Expose()
  @Type(() => ChatCompletionOutputContentPart)
  public content?: Array<ChatCompletionOutputContentPart>;
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
