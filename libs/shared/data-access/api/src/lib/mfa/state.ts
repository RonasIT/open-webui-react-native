import { Observable, observable } from '@legendapp/state';
import { MfaNextStep } from './enums';

interface MfaState {
  challengeToken?: string;
  nextStep?: MfaNextStep;
  recoveryCodes?: Array<string>;
  sessionToken?: string;
}

export const mfaState$: Observable<MfaState> = observable<MfaState>({});
