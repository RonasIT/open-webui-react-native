import { ExpoConfig } from '@expo/config';
import { EASConfig } from 'expo-constants/build/Constants.types';
import { AppEnv } from '../../libs/shared/utils/app-env/src/env';
import { AppEnvName } from '../../libs/shared/utils/app-env/src/app-env';
import { compact } from 'lodash-es';

const createConfig = (): Omit<ExpoConfig, 'extra'> & { extra: { eas: EASConfig } & typeof extra } => {
  const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
  const appEnv = new AppEnv((process.env.EXPO_PUBLIC_APP_ENV as AppEnvName) || 'development');

  const appId = process.env.EXPO_PUBLIC_APP_ID;

  const googleAuthIosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME;

  const extra = {
    eas: { projectId } as EASConfig,
    googleIosClientId: appEnv.select({
      default: process.env.GOOGLE_IOS_CLIENT_ID_DEV,
      production: process.env.GOOGLE_IOS_CLIENT_ID_PROD,
    }),
    isInternalRelease: process.env.EXPO_PUBLIC_IS_INTERNAL_RELEASE,
    googleSignInRoute: process.env.GOOGLE_SIGN_IN_ROUTE,
  };

  return {
    name: process.env.EXPO_PUBLIC_APP_NAME as string,
    slug: process.env.EXPO_PUBLIC_APP_SLUG as string,
    scheme: process.env.EXPO_PUBLIC_APP_SCHEME as string,
    owner: process.env.EXPO_PUBLIC_APP_OWNER as string,
    version: '1.4.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    runtimeVersion: '1.0.0',
    experiments: {
      reactCompiler: true,
    },
    updates: {
      url: `https://u.expo.dev/${projectId}`,
    },
    ios: {
      bundleIdentifier: appId,
      supportsTablet: false,
      buildNumber: appEnv.select({
        default: '11',
        production: '5',
      }),
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      package: appId,
      versionCode: appEnv.select({
        default: 11,
        production: 5,
      }),
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF',
      },
    },
    web: {
      bundler: 'metro',
    },
    plugins: compact([
      'expo-router',
      'expo-localization',
      'expo-asset',
      [
        'expo-splash-screen',
        {
          image: './assets/splash.png',
          backgroundColor: '#ffffff',
          imageWidth: 100,
          dark: {
            image: './assets/splash-dark.png',
            backgroundColor: '#000000',
          },
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'Allow Open Web UI to access your photos.',
          cameraPermission: 'Allow Open Web UI to access your camera.',
        },
      ],
      [
        'expo-media-library',
        {
          photosPermission: 'Allow Open Web UI to access your photos.',
          savePhotosPermission: 'Allow Open Web UI to save photos.',
        },
      ],
      googleAuthIosUrlScheme
        ? [
            '@react-native-google-signin/google-signin',
            {
              iosUrlScheme: googleAuthIosUrlScheme,
            },
          ]
        : null,
    ]),
    newArchEnabled: true,
    extra,
  };
};

export default createConfig;
