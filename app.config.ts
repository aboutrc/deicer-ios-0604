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
    eas: {
      projectId: "be205279-baa0-431e-8c0b-8af518b6ebee"
    }
  },
  scheme: "DEICER",
  web: {
    bundler: "metro",
    favicon: './assets/images/favicon.png'
  }
});