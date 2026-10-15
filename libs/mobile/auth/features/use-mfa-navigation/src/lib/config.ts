import { navigationConfig } from '@open-webui-react-native/mobile/shared/utils/navigation';
import { MfaNextStep } from '@open-webui-react-native/shared/data-access/api';

export const stepRoutes: Record<Exclude<MfaNextStep, MfaNextStep.PENDING>, string> = {
  [MfaNextStep.VERIFY]: navigationConfig.auth.mfa.verification,
  [MfaNextStep.ENROLL]: navigationConfig.auth.mfa.authenticatorSetup,
  [MfaNextStep.RECOVER]: navigationConfig.auth.mfa.recovery,
};
