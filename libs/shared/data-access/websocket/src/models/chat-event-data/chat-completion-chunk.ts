import { Expose, Type } from 'class-transformer';
import { MessageSource } from '@open-webui-react-native/shared/data-access/common';

export class ChatCompletionChunk {
  @Expose()
  public id: string;

  @Expose()
  public content: string;

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
