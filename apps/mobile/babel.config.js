module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
        },
      ],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],

          alias: {
            '@': './',
          },
        },
      ],
      [
        'react-native-boost/plugin',
        {
          verbose: false,
          silent: true,
          unistyles: false,
          ignores: ['node_modules/**', '../../node_modules/**'],
          optimizations: {
            text: true,
            view: true,
            image: false,
          },
        },
      ],
      'react-native-worklets/plugin',
    ],
    overrides: [
      {
        test: (filename) => !!filename && /libs[\\/]shared[\\/]data-access[\\/]/.test(filename),
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          ['@babel/plugin-transform-class-properties', { loose: true }],
        ],
      },
    ],
  };
};
