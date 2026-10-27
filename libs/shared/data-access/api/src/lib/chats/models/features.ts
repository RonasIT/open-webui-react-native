import { Expose } from 'class-transformer';

export class Features {
  @Expose({ name: 'code_interpreter' })
  public codeInterpreter: boolean;

  @Expose({ name: 'image_generation' })
  public imageGeneration: boolean;

  @Expose()
  public memory: boolean;

  @Expose({ name: 'web_search' })
  public webSearch: boolean;

  @Expose()
  public voice: boolean;

  constructor(features: Partial<Features> = {}) {
    Object.assign(this, features);
  }
}
