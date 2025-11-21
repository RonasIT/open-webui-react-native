import { BaseEntity } from '@ronas-it/rtkq-entity-api';
import { Expose, Type } from 'class-transformer';
import { AttachedFile } from '@open-webui-react-native/shared/data-access/common';
import { History } from './history';
import { Message } from './message';

export class Chat extends BaseEntity<string> {
  @Expose()
  public title: string;

  @Expose()
  public models: Array<string>;

  @Expose()
  @Type(() => History)
  public history: History;

  @Expose()
  @Type(() => Message)
  public messages: Array<Message>;

  @Expose()
  public timestamp: number;

  @Expose()
  public params?: Record<string, any>;

  @Expose()
  @Type(() => AttachedFile)
  public files?: Array<AttachedFile>;

  @Expose()
  public tags?: Array<string>;

  constructor(chat: Partial<Chat>) {
    super();
    Object.assign(this, chat);
  }
}
