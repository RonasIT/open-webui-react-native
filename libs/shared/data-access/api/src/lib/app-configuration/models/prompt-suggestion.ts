import { Expose } from 'class-transformer';

export class PromptSuggestion {
  @Expose()
  public title: Array<string>;

  @Expose()
  public content: string;

  constructor(partial: Partial<PromptSuggestion>) {
    Object.assign(this, partial);
  }
}
