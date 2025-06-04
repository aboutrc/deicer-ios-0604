import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'DEICER',
  slug: 'DEICER',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icons/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/icons/ios-splash-icon-light.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    "**/*"
  ],
  extra: {
    googleTranslateApiKey: process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY,
    openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY
  },
  plugins: [
    "expo-router"
  ],
  scheme: "DEICER",
  web: {
    bundler: "metro",
    favicon: './assets/images/favicon.png'
  },
  ios: {
    bundleIdentifier: "com.deicer.mobile",
    supportsTablet: true,
    icon: './assets/images/icons/ios-light.png'
  },
  android: {
    package: "com.deicer.mobile",
    adaptiveIcon: {
      foregroundImage: './assets/images/icons/adaptive-icon.png',
      backgroundColor: '#ffffff'
    }
  }
});