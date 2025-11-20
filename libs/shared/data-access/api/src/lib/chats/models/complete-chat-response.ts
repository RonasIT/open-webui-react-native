import { Expose } from 'class-transformer';

export class CompleteChatResponse {
  @Expose()
  public status: boolean;

  @Expose({ name: 'task_id' })
  public taskId: string;

  constructor(response: Partial<CompleteChatResponse> = {}) {
    Object.assign(this, response);
  }
}
