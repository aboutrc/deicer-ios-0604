import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'DEICER',
  slug: 'DEICER',
  owner: 'aboutrc',
  projectId: '8ecf7377-dbee-41ab-9c37-1db33536cdb1',
  version: '1.0.1',
  orientation: 'portrait',
  icon: './assets/images/icons/icon.png',
  userInterfaceStyle: 'automatic',
  developmentClient: {
    silentLaunch: false
  },
  splash: {
    image: './assets/images/icons/ios-splash-icon-dark.png',
    resizeMode: 'contain',
    backgroundColor: '#000000'
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    bundleIdentifier: "com.deicer.mobile",
    supportsTablet: true,
    icon: './assets/images/icons/ios-light.png',
    infoPlist: {
      UIBackgroundModes: ["location", "fetch"],
      NSLocationAlwaysAndWhenInUseUsageDescription: "DEICER needs your location to notify you about nearby activity and allow you to report incidents in your area. Your location data is never stored or shared.",
      NSLocationWhenInUseUsageDescription: "DEICER uses your location to show nearby activity on the map and allow you to report incidents. Your location is only used while the app is open.",
      NSLocationUsageDescription: "DEICER uses your location to provide real-time information about nearby activity. Your privacy is protected as we never store or share your location data."
    }
  },
  android: {
    package: "com.deicer.mobile",
    adaptiveIcon: {
      foregroundImage: './assets/images/icons/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    permissions: [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "ACCESS_BACKGROUND_LOCATION"
    ]
  },
  plugins: [
    "expo-router",
    "expo-font",
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission: "DEICER needs your location to notify you about nearby activity and allow you to report incidents in your area. Your location data is never stored or shared.",
        locationAlwaysPermission: "DEICER uses background location to send you notifications about nearby activity. Your location data is never stored or shared.",
        locationWhenInUsePermission: "DEICER uses your location to show nearby activity on the map and allow you to report incidents. Your location is only used while the app is open."
      }
    ]
  ],
  extra: {
    ...config.extra,
    router: {},
    googleTranslateApiKey: process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY,
    openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY
  },
  scheme: "DEICER",
  updates: {
    url: "https://u.expo.dev/8ecf7377-dbee-41ab-9c37-1db33536cdb1",
    fallbackToCacheTimeout: 0
  },
  runtimeVersion: {
    policy: "sdkVersion"
  }
});