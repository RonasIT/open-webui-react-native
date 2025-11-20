import { Expose, Type } from 'class-transformer';
import { SourceType } from '../../enums';
import { Collection } from '../collection';
import { AttachedFile } from '../files';
import { MessageSourceMetadata } from './message-source-metadata';

export class MessageSource {
  @Expose()
  public distances: Array<number>;

  @Expose()
  public document: Array<string>;

  @Expose()
  @Type(() => MessageSourceMetadata)
  public metadata: Array<MessageSourceMetadata>;

  @Expose()
  @Type(() => AttachedFile, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: AttachedFile, name: SourceType.FILE },
        { value: Collection, name: SourceType.COLLECTION },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  public source: AttachedFile | Collection;

  constructor(fileSource: Partial<MessageSource>) {
    Object.assign(this, fileSource);
  }
}
