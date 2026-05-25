import { ExpoConfig } from '@expo/config';
import { withAndroidManifest } from '@expo/config-plugins';
import { EASConfig } from 'expo-manifests';
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

  const withRemoveMediaPlaybackPermission = (config: ExpoConfig): ExpoConfig =>
    withAndroidManifest(config, (config) => {
      const manifest = config.modResults;

      if (!manifest.manifest.$['xmlns:tools']) {
        manifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
      }

      const permissions = (manifest.manifest['uses-permission'] ?? []) as Array<{ $: Record<string, string> }>;

      const alreadyAdded = permissions.some(
        (p) => p.$['android:name'] === 'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
      );

      if (!alreadyAdded) {
        permissions.push({
          $: {
            'android:name': 'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
            'tools:node': 'remove',
          },
        });
      }

      manifest.manifest['uses-permission'] = permissions as never;

      return config;
    }) as ExpoConfig;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return withRemoveMediaPlaybackPermission({
    name: 'Open MobileUI',
    slug: process.env.EXPO_PUBLIC_APP_SLUG as string,
    scheme: process.env.EXPO_PUBLIC_APP_SCHEME as string,
    owner: process.env.EXPO_PUBLIC_APP_OWNER as string,
    version: '1.4.9',
    orientation: 'portrait',
    icon: './assets/icon.png',
    runtimeVersion: '1.4.4',
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
        default: '18',
        production: '23',
      }),
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      package: appId,
      versionCode: appEnv.select({
        default: 15,
        production: 23,
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
          photosPermission: 'Allow Open MobileUI to access your photos.',
          cameraPermission: 'Allow Open MobileUI to access your camera.',
        },
      ],
      [
        'expo-media-library',
        {
          savePhotosPermission: 'Allow Open MobileUI to save photos.',
        },
      ],
      'expo-audio',
      [
        'expo-build-properties',
        {
          android: {
            androidGradlePluginVersion: '8.3.2',
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: '35.0.0',
            ndkVersion: '27.1.12297006',
            packagingOptions: {
              jniLibs: {
                useLegacyPackaging: false,
              },
            },
          },
          ios: {
            useFrameworks: 'static',
          },
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any) as any;
};

export default createConfig;
