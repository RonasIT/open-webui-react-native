const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const { withNativeWind } = require('nativewind/metro');
const { withNxMetro } = require('@nx/expo');
const { mergeConfig } = require('metro-config');
const path = require('path');

const appRoot = __dirname;
const monorepoRoot = path.resolve(appRoot, '../..');
const defaultConfig = getSentryExpoConfig(appRoot);
const { assetExts, sourceExts } = defaultConfig.resolver;
/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const customConfig = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    //NOTE workaround - https://stackoverflow.com/questions/77844546/assertionerror-err-assertion-assets-must-have-hashed-files-ensure-the-expo-a
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'cjs', 'mjs', 'svg'],
  },
};

module.exports = withNxMetro(mergeConfig(defaultConfig, customConfig), {
  // Change this to true to see debugging info.
  // Useful if you have issues resolving modules
  debug: false,
  // all the file extensions used for imports other than 'ts', 'tsx', 'js', 'jsx', 'json'
  extensions: [],
  // Specify folders to watch, in addition to Nx defaults (workspace libraries and node_modules)
  watchFolders: [monorepoRoot],
}).then((config) => {
  // withNxMetro narrows resolver.nodeModulesPaths to the workspace root only. Re-add Expo's
  // defaults (app-level + root node_modules) so module resolution and expo-doctor stay happy.
  config.resolver.nodeModulesPaths = Array.from(
    new Set([...(defaultConfig.resolver.nodeModulesPaths ?? []), ...(config.resolver.nodeModulesPaths ?? [])]),
  );

  return withNativeWind(config, { input: './global.css', inlineRem: 16 });
});
