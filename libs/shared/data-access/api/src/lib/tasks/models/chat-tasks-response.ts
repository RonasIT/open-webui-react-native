import { Expose } from 'class-transformer';

export class ChatTasksResponse {
  @Expose({ name: 'task_ids' })
  public tasksIds: Array<string>;

  constructor(data: Partial<ChatTasksResponse>) {
    Object.assign(this, data);
  }
}
