import { Observable, observable } from '@legendapp/state';
import { cookieService } from '@open-webui-react-native/shared/data-access/cookie';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';

export interface AccessPass {
  serverUrl: string;
  value: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isUnauthorized: boolean;
  // NOTE: Cloudflare Access stopped taking the pass while the Open WebUI session is kept.
  isAccessPassExpired: boolean;
  // NOTE: The Cloudflare Access pass (`CF_Authorization`) with the server it was issued for. It is saved as soon as
  // the sign-in WebView hands it over, even before the server is saved, and goes only to that server's origin.
  accessPass: AccessPass | null;
  logout: () => void;
  signIn: (token: string) => void;
  setAccessPass: (accessPass: AccessPass) => void;
  clearAccessPass: () => void;
}

const readSavedAccessPass = (): AccessPass | null => {
  try {
    const accessPass = JSON.parse(appStorageService.accessPass.get() ?? 'null');

    return accessPass?.serverUrl && accessPass?.value ? accessPass : null;
  } catch {
    return null;
  }
};

export const authState$: Observable<AuthState> = observable<AuthState>({
  isAuthenticated: false,
  isUnauthorized: false,
  isAccessPassExpired: false,
  accessPass: readSavedAccessPass(),
  logout: () => {
    appStorageService.token.set(null);
    authState$.isAuthenticated.set(false);
    authState$.isUnauthorized.set(false);
    authState$.isAccessPassExpired.set(false);
  },
  signIn: (token) => {
    appStorageService.token.set(token);
    authState$.isAuthenticated.set(true);
  },
  setAccessPass: (accessPass) => {
    appStorageService.accessPass.set(JSON.stringify(accessPass));
    authState$.accessPass.set(accessPass);
  },
  // NOTE: Also wipes the Cloudflare sign-in session the WebView keeps, so the next person has to pass Access again.
  clearAccessPass: () => {
    appStorageService.accessPass.remove();
    authState$.accessPass.set(null);
    cookieService.clearWebViewSession();
  },
});
