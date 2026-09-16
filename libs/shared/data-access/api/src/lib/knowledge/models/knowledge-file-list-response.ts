import { Expose, Type } from 'class-transformer';
import { FileData } from '@open-webui-react-native/shared/data-access/common';

export class KnowledgeFileListResponse {
  @Expose()
  @Type(() => FileData)
  public items: Array<FileData>;

  @Expose()
  public total: number;

  constructor(response: Partial<KnowledgeFileListResponse> = {}) {
    Object.assign(this, response);
  }
}
