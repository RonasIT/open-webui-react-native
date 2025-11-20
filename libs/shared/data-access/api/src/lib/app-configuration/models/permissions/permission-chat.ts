import { Expose } from 'class-transformer';

export class PermissionsChat {
  @Expose()
  public controls: boolean;

  @Expose({ name: 'system_prompt' })
  public systemPrompt: boolean;

  @Expose({ name: 'file_upload' })
  public fileUpload: boolean;

  @Expose()
  public delete: boolean;

  @Expose()
  public edit: boolean;

  @Expose()
  public share: boolean;

  @Expose()
  public export: boolean;

  @Expose()
  public stt: boolean;

  @Expose()
  public tts: boolean;

  @Expose()
  public call: boolean;

  @Expose({ name: 'multiple_models' })
  public multipleModels: boolean;

  @Expose()
  public temporary: boolean;

  @Expose({ name: 'temporary_enforced' })
  public temporaryEnforced: boolean;

  constructor(partial: Partial<PermissionsChat>) {
    Object.assign(this, partial);
  }
}
