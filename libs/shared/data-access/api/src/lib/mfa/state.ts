import { Observable, observable } from '@legendapp/state';

interface MfaState {
  challengeToken?: string;
  recoveryCodes?: Array<string>;
  sessionToken?: string;
}

export const mfaState$: Observable<MfaState> = observable<MfaState>({});
