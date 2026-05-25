const { withAndroidManifest } = require('@expo/config-plugins');

const withRemoveMediaPlaybackPermission = (config) =>
  withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    if (!manifest.manifest.$['xmlns:tools']) {
      manifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    const permissions = manifest.manifest['uses-permission'] ?? [];

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

    manifest.manifest['uses-permission'] = permissions;

    return config;
  });

module.exports = withRemoveMediaPlaybackPermission;
