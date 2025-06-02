const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get the default Expo Metro config
const defaultConfig = getDefaultConfig(__dirname);

// Extend the default config
module.exports = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    alias: {
      '@': path.resolve(__dirname),
    },
    extraNodeModules: {
      // Polyfills for Node.js core modules
      events: require.resolve('events/'),
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      net: require.resolve('node-libs-browser/mock/net'),
      tls: require.resolve('node-libs-browser/mock/tls'),
      zlib: require.resolve('browserify-zlib'),
      path: require.resolve('path-browserify'),
      url: require.resolve('url/'),
      crypto: require.resolve('crypto-browserify'),
      fs: false,
      assert: require.resolve('assert/'),
      util: require.resolve('util/'),
      buffer: require.resolve('buffer/'),
    },
  },
};