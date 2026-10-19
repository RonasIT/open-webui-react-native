import { instanceToPlain, plainToInstance } from 'class-transformer';
import { getApiService } from '@open-webui-react-native/shared/data-access/api-client';
import { SignInResponse } from '../auth/models';
import { mfaApiConfig } from './config';
import {
  ConfirmMfaEnrollmentRequest,
  MfaChallenge,
  RecoverMfaRequest,
  StartMfaEnrollmentResponse,
  VerifyMfaRequest,
} from './models';

class MfaService {
  public async startEnrollment(challengeToken: string): Promise<StartMfaEnrollmentResponse> {
    const response: object = await getApiService().post(`${mfaApiConfig.route}/enroll/start`, {
      challenge_token: challengeToken,
    });

    return plainToInstance(StartMfaEnrollmentResponse, response);
  }

  public async confirmEnrollment(request: ConfirmMfaEnrollmentRequest): Promise<SignInResponse> {
    const response: object = await getApiService().post(
      `${mfaApiConfig.route}/enroll/confirm`,
      instanceToPlain(request),
    );

    return plainToInstance(SignInResponse, response);
  }

  public async verify(request: VerifyMfaRequest): Promise<SignInResponse> {
    const response: object = await getApiService().post(`${mfaApiConfig.route}/verify`, instanceToPlain(request));

    return plainToInstance(SignInResponse, response);
  }

  public async recover(request: RecoverMfaRequest): Promise<MfaChallenge> {
    const response: object = await getApiService().post(`${mfaApiConfig.route}/recover`, instanceToPlain(request));

    return plainToInstance(MfaChallenge, response);
  }
}

export const mfaService = new MfaService();
