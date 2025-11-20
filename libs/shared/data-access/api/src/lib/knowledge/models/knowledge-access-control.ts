import { Expose, Type } from 'class-transformer';
import { KnowledgeAccessControlGroups } from './knowledge-access-control-groups';

export class KnowledgeAccessControl {
  @Expose()
  @Type(() => KnowledgeAccessControlGroups)
  public read: KnowledgeAccessControlGroups;

  @Expose()
  @Type(() => KnowledgeAccessControlGroups)
  public write: KnowledgeAccessControlGroups;

  constructor(data: Partial<KnowledgeAccessControl> = {}) {
    Object.assign(this, data);
  }
}
