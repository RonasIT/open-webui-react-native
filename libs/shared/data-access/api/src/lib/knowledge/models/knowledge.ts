import { BaseEntity } from '@ronas-it/rtkq-entity-api';
import { Expose, Type } from 'class-transformer';
import { Profile } from '../../auth/models/profile';
import { KnowledgeAccessControl } from './knowledge-access-control';
import { KnowledgeData } from './knowledge-data';
import { KnowledgeFile } from './knowledge-file';

export class Knowledge extends BaseEntity<string> {
  @Expose({ name: 'user_id' })
  public userId: string;

  @Expose()
  public name: string;

  @Expose()
  public description: string;

  @Expose()
  public meta: { document?: any } | null;

  @Expose()
  @Type(() => KnowledgeData)
  public data: KnowledgeData | null;

  @Expose({ name: 'access_control' })
  @Type(() => KnowledgeAccessControl)
  public accessControl: KnowledgeAccessControl | null;

  @Expose()
  @Type(() => Profile)
  public user: Omit<Profile, 'permissions'>;

  @Expose()
  @Type(() => KnowledgeFile)
  public files: Array<KnowledgeFile>;

  public get isDocument(): boolean {
    return !!this.meta?.document;
  }

  constructor(data: Partial<Knowledge> = {}) {
    super();
    Object.assign(this, data);
  }
}
