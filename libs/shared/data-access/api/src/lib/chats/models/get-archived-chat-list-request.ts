import { Expose } from 'class-transformer';
import { ArchivedChatListOrderBy, ArchivedChatListOrderDirection } from '../enums';

export class GetArchivedChatListRequest {
  @Expose()
  public page: number;

  @Expose()
  public query?: string;

  @Expose()
  public direction: ArchivedChatListOrderDirection;

  @Expose({ name: 'order_by' })
  public orderBy: ArchivedChatListOrderBy;

  constructor(request: Partial<GetArchivedChatListRequest> = {}) {
    Object.assign(this, request);
  }
}
