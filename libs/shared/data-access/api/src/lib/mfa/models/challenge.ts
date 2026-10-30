import { Expose } from 'class-transformer';
import { MfaNextStep } from '../enums';

export class MfaChallenge {
  @Expose({ name: 'next_step' })
  public nextStep: MfaNextStep;

  @Expose({ name: 'challenge_token' })
  public challengeToken: string;

  constructor(model: Partial<MfaChallenge>) {
    Object.assign(this, model);
  }
}
