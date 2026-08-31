import { BaseEntity } from '@ronas-it/rtkq-entity-api';
import { Expose, Type } from 'class-transformer';
import {
  AttachedFile,
  AttachedImage,
  FileType,
  MessageSource,
  Role,
} from '@open-webui-react-native/shared/data-access/common';
import {
  ChatCompletionOutputItem,
  ChatMessageError,
  ChatStatusData,
} from '@open-webui-react-native/shared/data-access/websocket';

export class Message extends BaseEntity<string> {
  @Expose({ name: 'user_id' })
  public userId?: string;

  @Expose({ name: 'channel_id' })
  public channelId?: string | null;

  @Expose()
  public parentId?: string | null;

  @Expose()
  public content: string;

  // NOTE: Open WebUI 0.11.0+ persists assistant text as an `output` array (Responses API
  // format) in addition to `content`. Kept so the client can derive text itself and stay
  // compatible with both the old (flat `content`) and new (`output`) backend formats.
  @Expose()
  @Type(() => ChatCompletionOutputItem)
  public output?: Array<ChatCompletionOutputItem>;

  @Expose()
  public childrenIds?: Array<string>;

  @Expose()
  public role: Role;

  @Expose()
  public timestamp: number;

  @Expose()
  public models: Array<string>;

  @Expose()
  public model: string;

  @Expose()
  public modelName: string;

  @Expose()
  public data?: Record<string, any>;

  @Expose()
  public meta?: Record<string, any>;

  @Expose()
  @Type(() => AttachedFile, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: AttachedFile, name: FileType.FILE },
        { value: AttachedImage, name: FileType.IMAGE },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  public files?: Array<AttachedFile | AttachedImage>;

  @Expose()
  @Type(() => MessageSource)
  public sources?: Array<MessageSource>;

  @Expose()
  public done?: boolean;

  // NOTE: The backend persists a failed turn's error on the message itself, so it survives a reload.
  @Expose()
  @Type(() => ChatMessageError)
  public error?: ChatMessageError;

  // We need this field to keep track of the chat status via socket events
  @Expose()
  public socketStatusData?: ChatStatusData;

  @Expose({ name: 'follow_ups' })
  public followUps?: Array<string>;

  constructor(message: Partial<Message>) {
    super();
    Object.assign(this, message);
  }
}
