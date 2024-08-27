module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo', '@babel/preset-typescript'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          envName: 'APP_ENV',
          moduleName: 'react-native-dotenv',
          path: '.env',
        },
      ],
      [
        'module-resolver',
        {
          alias: {
            events: 'events',
            stream: 'stream-browserify'
          }
        }
      ]
    ],
  };
};
