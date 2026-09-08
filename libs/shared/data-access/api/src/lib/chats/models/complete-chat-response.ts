import { Expose } from 'class-transformer';

export class CompleteChatResponse {
  @Expose()
  public status: boolean;

  constructor(response: Partial<CompleteChatResponse> = {}) {
    Object.assign(this, response);
  }
}
