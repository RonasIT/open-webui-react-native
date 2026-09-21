import { Expose } from 'class-transformer';

// NOTE: Since Open WebUI 0.11.0 the completion stream delivers assistant text inside an
// `output` array (Responses API format) instead of a flat `content` string. Each `message`
// item carries `content` parts of type `output_text`.
export class ChatCompletionOutputContentPart {
  @Expose()
  public type?: string;

  @Expose()
  public text?: string;
}
