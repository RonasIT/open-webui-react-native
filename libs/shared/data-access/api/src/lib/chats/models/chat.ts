import { BaseEntity } from '@ronas-it/rtkq-entity-api';
import { Expose, Type } from 'class-transformer';
import {
  AttachedFile,
  AttachedKnowledgeCollection,
  FileType,
} from '@open-webui-react-native/shared/data-access/common';
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
  @Type(() => AttachedFile, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: AttachedFile, name: FileType.FILE },
        { value: AttachedKnowledgeCollection, name: FileType.COLLECTION },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  public files?: Array<AttachedFile | AttachedKnowledgeCollection>;

  @Expose()
  public tags?: Array<string>;

  constructor(chat: Partial<Chat>) {
    super();
    Object.assign(this, chat);
  }
}
