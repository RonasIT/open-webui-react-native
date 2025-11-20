import { Expose } from 'class-transformer';

export class CodeConfig {
  @Expose()
  public engine: string;

  constructor(partial: Partial<CodeConfig>) {
    Object.assign(this, partial);
  }
}
