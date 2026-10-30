import { MfaRecoveryCodes } from '@open-webui-react-native/mobile/auth/features/mfa-recovery-codes';
import { ScreenWrapper } from '@open-webui-react-native/mobile/shared/ui/screen-wrapper';
import { ReactElement } from 'react';

export default function MfaRecoveryCodesScreen(): ReactElement {
  return (
    <ScreenWrapper screenProps={{ scrollDisabled: true, noOutsideSpacing: true }}>
      <MfaRecoveryCodes />
    </ScreenWrapper>
  );
}
