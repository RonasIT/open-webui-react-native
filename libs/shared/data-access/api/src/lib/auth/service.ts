import { instanceToPlain, plainToInstance } from 'class-transformer';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { authApiConfig } from './config';
import { SignInResponse, SignInRequest, UpdateProfileRequest, UpdatePasswordRequest } from './models';

class AuthService {
  public async signInWithEmailPassword(request: SignInRequest): Promise<SignInResponse> {
    const response: SignInResponse = await getApiService().post(`${authApiConfig.route}/signin`, request);

    if (response.token) {
      authState$.signIn(response.token);
    }

    return plainToInstance(SignInResponse, response);
  }

  // The token is passed explicitly because logout wipes it from storage right after firing this request,
  // before tokenInterceptor reads it on dispatch.
  public async signOut(token: string): Promise<void> {
    const headers = { Authorization: `Bearer ${token}` };
    const params = { skipToast: true };

    try {
      await getApiService().post(`${authApiConfig.route}/signout`, undefined, { params, headers });
    } catch (error) {
      // Fallback for Open WebUI < 0.6.23 (before PR #24420), where /signout was GET.
      if ((error as { response?: { status?: number } })?.response?.status === 405) {
        await getApiService().get(`${authApiConfig.route}/signout`, params, { headers });

        return;
      }
      throw error;
    }
  }

  public async getProfile(): Promise<SignInResponse> {
    const response: SignInResponse = await getApiService().get(`${authApiConfig.route}/`);

    return plainToInstance(SignInResponse, response);
  }

  public async updateProfile(request: UpdateProfileRequest): Promise<UpdateProfileRequest> {
    const response: UpdateProfileRequest = await getApiService().post(
      `${authApiConfig.route}/update/profile`,
      instanceToPlain(request),
    );

    return plainToInstance(UpdateProfileRequest, response);
  }

  public async updatePassword(request: UpdatePasswordRequest): Promise<void> {
    await getApiService().post(`${authApiConfig.route}/update/password`, instanceToPlain(request));
  }
}

export const authService = new AuthService();
