import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { HttpStatusCode, isAxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { navigationConfig, useInitialNavigation } from '@open-webui-react-native/mobile/shared/utils/navigation';
import { isExpiredMfaChallengeError, MfaChallenge, mfaState$ } from '@open-webui-react-native/shared/data-access/api';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { stepRoutes } from './config';

interface UseMfaNavigationUsage {
  openStep: (challenge: MfaChallenge, shouldReplace?: boolean) => void;
  openRecoveryCodes: (sessionToken: string, recoveryCodes: Array<string>) => void;
  completeSignIn: (sessionToken: string) => void;
  backToSignIn: () => void;
  handleError: (error: unknown) => void;
}

export function useMfaNavigation(): UseMfaNavigationUsage {
  const router = useRouter();
  const { resetToCreateChatScreen } = useInitialNavigation();

  const openStep: UseMfaNavigationUsage['openStep'] = (challenge, shouldReplace) => {
    mfaState$.set({ challengeToken: challenge.challengeToken });
    const route = `/${stepRoutes[challenge.nextStep as keyof typeof stepRoutes]}`;

    if (shouldReplace) {
      router.replace(route);
    } else {
      router.push(route);
    }
  };

  const openRecoveryCodes: UseMfaNavigationUsage['openRecoveryCodes'] = (sessionToken, recoveryCodes) => {
    mfaState$.assign({ sessionToken, recoveryCodes });
    router.replace(`/${navigationConfig.auth.mfa.recoveryCodes}`);
  };

  const completeSignIn: UseMfaNavigationUsage['completeSignIn'] = (sessionToken) => {
    authState$.signIn(sessionToken);
    //NOTE The main stack is registered only after the auth state re-renders the root layout.
    setTimeout(() => {
      resetToCreateChatScreen();
      mfaState$.set({});
      ToastService.showSuccess(i18n.t('AUTH.SIGN_IN.TEXT_YOU_LOGGED_IN'));
    }, 100);
  };

  const backToSignIn = (): void => {
    mfaState$.set({});
    router.dismissTo(`/${navigationConfig.auth.signIn}`);
  };

  const handleError: UseMfaNavigationUsage['handleError'] = (error) => {
    if (isAxiosError<{ detail?: unknown }>(error) && error.response?.status === HttpStatusCode.Unauthorized) {
      const detail = error.response.data?.detail;
      ToastService.showError(
        typeof detail === 'string' ? detail : i18n.t('SHARED.API_ERRORS.TEXT_SOMETHING_WENT_WRONG'),
      );
    }

    if (isExpiredMfaChallengeError(error)) {
      backToSignIn();
    }
  };

  return { openStep, openRecoveryCodes, completeSignIn, backToSignIn, handleError };
}
