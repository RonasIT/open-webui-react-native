export class DefaultSystemPromptFormSchema {
  public systemPrompt: string;

  constructor(schema?: Partial<DefaultSystemPromptFormSchema>) {
    this.systemPrompt = schema?.systemPrompt || '';
  }
}
