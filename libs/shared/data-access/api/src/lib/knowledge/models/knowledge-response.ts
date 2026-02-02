import { Expose, Type } from 'class-transformer';
import { Knowledge } from './knowledge';

export class KnowledgeResponse {
  @Expose()
  @Type(() => Knowledge)
  public items: Array<Knowledge>;

  @Expose()
  public total: number;

  constructor(response: Partial<KnowledgeResponse> = {}) {
    Object.assign(this, response);
  }
}
