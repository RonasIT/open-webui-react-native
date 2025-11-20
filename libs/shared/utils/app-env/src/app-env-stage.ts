import { AppEnvName } from './app-env';

export const appEnvStage: Record<AppEnvName, number> = {
  development: 1,
  staging: 2,
  production: 3,
};
