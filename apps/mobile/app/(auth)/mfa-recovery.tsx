import { MfaRecovery } from '@open-webui-react-native/mobile/auth/features/mfa-recovery';
import { ScreenWrapper } from '@open-webui-react-native/mobile/shared/ui/screen-wrapper';
import { ReactElement } from 'react';

export default function MfaRecoveryScreen(): ReactElement {
  return (
    <ScreenWrapper screenProps={{ scrollDisabled: true, noOutsideSpacing: true }}>
      <MfaRecovery />
    </ScreenWrapper>
  );
}
