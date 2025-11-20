import { Expose } from 'class-transformer';

export class KnowledgeAccessControlGroups {
  @Expose({ name: 'group_ids' })
  public groupIds: Array<string>;

  @Expose({ name: 'user_ids' })
  public userIds: Array<string>;

  constructor(data: Partial<KnowledgeAccessControlGroups> = {}) {
    Object.assign(this, data);
  }
}
