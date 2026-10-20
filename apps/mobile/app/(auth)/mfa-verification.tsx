import { MfaVerification } from '@open-webui-react-native/mobile/auth/features/mfa-verification';
import { ScreenWrapper } from '@open-webui-react-native/mobile/shared/ui/screen-wrapper';
import { ReactElement } from 'react';

export default function MfaVerificationScreen(): ReactElement {
  return (
    <ScreenWrapper screenProps={{ scrollDisabled: true, noOutsideSpacing: true }}>
      <MfaVerification />
    </ScreenWrapper>
  );
}
