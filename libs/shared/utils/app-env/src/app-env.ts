import { AppEnv } from './env';

export type AppEnvName = 'development' | 'staging' | 'production';

export const appEnv = new AppEnv<AppEnvName>((process.env.EXPO_PUBLIC_APP_ENV || 'development') as AppEnvName);
