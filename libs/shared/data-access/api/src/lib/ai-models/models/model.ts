import { Expose, Type } from 'class-transformer';
import { OpenAIModel } from './open-ai-model';

export class AIModel {
  @Expose()
  public id: string;

  @Expose()
  public object: string;

  @Expose()
  public created: number;

  @Expose({ name: 'owned_by' })
  public ownedBy: string;

  @Expose({ name: 'connection_type' })
  public connectionType: string;

  @Expose()
  public name: string;

  @Expose()
  public urlIdx: number;

  @Expose()
  @Type(() => OpenAIModel)
  public openai: OpenAIModel;

  constructor(request: Partial<AIModel>) {
    Object.assign(this, request);
  }
}
