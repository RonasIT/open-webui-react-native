import { Expose } from 'class-transformer';

export class OpenAIModel {
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
}
