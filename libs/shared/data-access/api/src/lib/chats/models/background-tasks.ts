import { Expose } from 'class-transformer';

export class BackgroundTasks {
  @Expose({ name: 'follow_up_generation' })
  public followUpGeneration: boolean;

  @Expose({ name: 'tags_generation' })
  public tagsGeneration: boolean;

  @Expose({ name: 'title_generation' })
  public titleGeneration: boolean;

  constructor(backgroundTasks: Partial<BackgroundTasks> = {}) {
    Object.assign(this, backgroundTasks);
  }
}
