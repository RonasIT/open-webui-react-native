import { Observable, observable } from '@legendapp/state';
import { cookieService } from '@open-web-ui-mobile-client-react-native/shared/data-access/cookie';
import { appStorageService } from '@open-web-ui-mobile-client-react-native/shared/data-access/storage';

interface AuthState {
  isAuthenticated: boolean;
  isUnauthorized: boolean;
  logout: () => void;
  signIn: (token: string) => void;
}

export const authState$: Observable<AuthState> = observable<AuthState>({
  isAuthenticated: false,
  isUnauthorized: false,
  logout: () => {
    appStorageService.token.set(null);
    authState$.isAuthenticated.set(false);
    authState$.isUnauthorized.set(false);
  },
  signIn: (token) => {
    cookieService.setToken(token);
    appStorageService.token.set(token);
    authState$.isAuthenticated.set(true);
  },
});
