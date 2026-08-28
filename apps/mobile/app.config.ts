import { ExpoConfig } from '@expo/config';
import { EASConfig } from 'expo-manifests';
import { AppEnv } from '../../libs/shared/utils/app-env/src/env';
import { AppEnvName } from '../../libs/shared/utils/app-env/src/app-env';
import { compact } from 'lodash-es';

const createConfig = (): Omit<ExpoConfig, 'extra'> & { extra: { eas: EASConfig } & typeof extra } => {
  const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
  const appEnv = new AppEnv((process.env.EXPO_PUBLIC_APP_ENV as AppEnvName) || 'development');

  const appId = process.env.EXPO_PUBLIC_APP_ID;

  const extra = {
    eas: { projectId } as EASConfig,
    sentry: {
      dsn: process.env.SENTRY_DSN,
    },
    amplitude: {
      apiKeyDev: process.env.AMPLITUDE_API_KEY_DEV,
      apiKeyProd: process.env.AMPLITUDE_API_KEY_PROD,
    },
    supabase: {
      url: process.env.SUPABASE_URL,
      publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
    },
    env: appEnv.current,
    googleIosClientId: appEnv.select({
      default: process.env.GOOGLE_IOS_CLIENT_ID_DEV,
      production: process.env.GOOGLE_IOS_CLIENT_ID_PROD,
    }),
    isInternalRelease: process.env.EXPO_PUBLIC_IS_INTERNAL_RELEASE,
    googleSignInRoute: process.env.GOOGLE_SIGN_IN_ROUTE,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return {
    name: process.env.EXPO_PUBLIC_APP_NAME as string,
    slug: process.env.EXPO_PUBLIC_APP_SLUG as string,
    scheme: process.env.EXPO_PUBLIC_APP_SCHEME as string,
    owner: process.env.EXPO_PUBLIC_APP_OWNER as string,
    version: '1.9.0',
    userInterfaceStyle: 'automatic',
    orientation: 'portrait',
    icon: './assets/icon.png',
    runtimeVersion: {
      policy: 'appVersion',
    },
    experiments: {
      reactCompiler: true,
    },
    updates: {
      url: `https://u.expo.dev/${projectId}`,
    },
    ios: {
      bundleIdentifier: appId,
      appStoreUrl: `https://apps.apple.com/app/id${process.env.EXPO_PUBLIC_IOS_APP_STORE_ID}`,
      supportsTablet: false,
      buildNumber: appEnv.select({
        default: '18',
        production: '38',
      }),
      config: {
        usesNonExemptEncryption: false,
      },
      infoPlist: {
        // Allow connecting to self-hosted Open WebUI servers that are reachable
        // only over plain HTTP (local network, Docker, Raspberry Pi, Tailscale).
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
          NSAllowsLocalNetworking: true,
        },
      },
    },
    android: {
      package: appId,
      playStoreUrl: `https://play.google.com/store/apps/details?id=${appId}`,
      versionCode: appEnv.select({
        default: 15,
        production: 38,
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
          photosPermission:
            'Open MobileUI uses your photo library to let you select and share images in chat conversations and set your profile picture.',
          cameraPermission:
            'Open MobileUI uses your camera to let you take photos and share them directly in chat conversations.',
        },
      ],
      [
        'expo-camera',
        {
          cameraPermission:
            'Open MobileUI uses your camera to let you share live visuals during voice mode conversations.',
          recordAudioAndroid: false,
        },
      ],
      [
        'expo-media-library',
        {
          savePhotosPermission:
            'Open MobileUI saves photos to your library when you download images shared in chat conversations.',
        },
      ],
      [
        'expo-audio',
        {
          microphonePermission:
            'Open MobileUI uses your microphone to let you record and send voice messages in chat conversations.',
          enableBackgroundPlayback: false,
          enableBackgroundRecording: false,
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            // Allow plain HTTP connections to self-hosted servers (local network,
            // Tailscale, etc.). Mirrors iOS NSAllowsArbitraryLoads above.
            usesCleartextTraffic: true,
          },
        },
      ],
    ]),
    newArchEnabled: true,
    extra,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
};

export default createConfig;
