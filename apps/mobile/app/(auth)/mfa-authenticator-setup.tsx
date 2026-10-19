import { MfaAuthenticatorSetup } from '@open-webui-react-native/mobile/auth/features/mfa-authenticator-setup';
import { ScreenWrapper } from '@open-webui-react-native/mobile/shared/ui/screen-wrapper';
import { ReactElement } from 'react';

export default function MfaAuthenticatorSetupScreen(): ReactElement {
  return (
    <ScreenWrapper screenProps={{ scrollDisabled: true, noOutsideSpacing: true }}>
      <MfaAuthenticatorSetup />
    </ScreenWrapper>
  );
}
