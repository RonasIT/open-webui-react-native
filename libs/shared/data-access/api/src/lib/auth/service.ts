import { instanceToPlain, plainToInstance } from 'class-transformer';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { authApiConfig } from './config';
import { SignInResponse, SignInRequest, GoogleSignInRequest } from './models';

class AuthService {
  public async signInWithEmailPassword(request: SignInRequest): Promise<SignInResponse> {
    const response: SignInResponse = await getApiService().post(`${authApiConfig.route}/signin`, request);

    authState$.signIn(response.token);

    return plainToInstance(SignInResponse, response);
  }

  public async signOut(): Promise<void> {
    await getApiService().get(`${authApiConfig.route}/signout`);
  }

  public async getProfile(): Promise<SignInResponse> {
    const response: SignInResponse = await getApiService().get(`${authApiConfig.route}/`);

    return plainToInstance(SignInResponse, response);
  }

  public async signInWithGoogle(request: GoogleSignInRequest): Promise<SignInResponse> {
    const response: SignInResponse = await getApiService().post(
      authApiConfig.googleSignInRoute,
      instanceToPlain(new GoogleSignInRequest(request)),
    );

    authState$.signIn(response.token);

    return plainToInstance(SignInResponse, response);
  }
}

export const authService = new AuthService();
