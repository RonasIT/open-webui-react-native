import { Expose, Type } from 'class-transformer';
import { FileData } from '@open-webui-react-native/shared/data-access/common';
import { ProcessUrlType } from '../enums';

export class ProcessUrlResponse {
  @Expose()
  public status: boolean;

  @Expose()
  public type: ProcessUrlType;

  @Expose()
  public name: string;

  @Expose()
  public url: string;

  @Expose({ name: 'collection_name' })
  public collectionName?: string;

  @Expose()
  public content?: string;

  @Expose()
  @Type(() => FileData)
  public file?: FileData;

  constructor(response: Partial<ProcessUrlResponse>) {
    Object.assign(this, response);
  }
}
