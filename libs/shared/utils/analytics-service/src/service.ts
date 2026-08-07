import { init, setUserId, reset, Types, track } from '@amplitude/analytics-react-native';
import Constants from 'expo-constants';
import { amplitudeApiKey } from './config';

class AnalyticsService {
  public init(): void {
    init(amplitudeApiKey as string, undefined, {
      serverZone: 'EU',
      trackingOptions: {
        adid: false,
        appSetId: false,
        carrier: false,
        deviceManufacturer: false,
        deviceModel: true,
        ipAddress: true,
        idfv: false,
        language: true,
        osName: true,
        osVersion: true,
        platform: true,
      },
      logLevel: Types.LogLevel.Debug,
      appVersion: Constants.expoConfig?.version,
    });
  }

  public setUser(userId: string): void {
    setUserId(userId);
  }

  public resetUser(): void {
    reset();
  }

  public trackEvent(eventName: string, eventProperties?: Record<string, unknown>): void {
    track(eventName, eventProperties);
  }
}

export const analyticsService = new AnalyticsService();
