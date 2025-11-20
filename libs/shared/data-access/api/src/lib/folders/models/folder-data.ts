import { Expose, plainToInstance, Transform } from 'class-transformer';
import { AttachedFile, FileType } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';
import { Knowledge } from '../../knowledge/models/knowledge';

export class FolderData {
  @Expose({ name: 'system_prompt' })
  public systemPrompt?: string;

  @Expose()
  @Transform(({ value }) =>
    value?.map((item: any) =>
      item.type === FileType.FILE ? plainToInstance(AttachedFile, item) : plainToInstance(Knowledge, item),
    ),
  )
  public files?: Array<AttachedFile | Knowledge>;

  constructor(folderData: Partial<FolderData>) {
    Object.assign(this, folderData);
  }
}
