import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { supabase } from '@/lib/supabase';
import { AndroidNotificationPriority } from 'expo-notifications';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUND_FETCH_TASK = 'background-location-task';
const LOCATION_TASK = 'background-location';
const LOCATION_TASK_NAME = 'background-location';
const NOTIFICATION_INTERVAL_KEY = 'notification_interval_minutes';
const DEFAULT_INTERVAL = 20; // Default 20 minutes in milliseconds

// Note: While background updates occur every 20 minutes, users are encouraged to use
// the refresh button in the map module for real-time updates of nearby activity.

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: AndroidNotificationPriority.HIGH
  }),
});

// Register background fetch task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const location = await Location.getCurrentPositionAsync();
    
    // Check for nearby ICE markers
    const { data: markers } = await supabase.rpc('check_nearby_ice_markers', {
      user_lat: location.coords.latitude,
      user_lon: location.coords.longitude,
      radius_miles: 1
    });

    if (markers && markers.length > 0) {
      // Create notifications for each nearby marker
      for (const marker of markers) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Community Safety Alert',
            body: `Activity reported ${marker.distance.toFixed(1)} miles from your location. Tap for details.`,
            data: { markerId: marker.marker_id },
          },
          trigger: null, // Send immediately
        });
      }
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background fetch failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register background location task
TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }
  
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];
    
    // Check for nearby ICE markers
    try {
      const { data: markers } = await supabase.rpc('check_nearby_ice_markers', {
        user_lat: location.coords.latitude,
        user_lon: location.coords.longitude,
        radius_miles: 1
      });

      if (markers && markers.length > 0) {
        for (const marker of markers) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'ICE Activity Reported Nearby',
              body: `ICE activity reported ${marker.distance.toFixed(1)} miles from your location`,
              data: { markerId: marker.marker_id },
            },
            trigger: null,
          });
        }
      }
    } catch (error) {
      console.error('Failed to check nearby markers:', error);
    }
  }
});

export const startBackgroundServices = async (intervalMinutes?: number) => {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      Alert.alert('Permission required', 'Please enable location services to use this feature.');
      return;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      Alert.alert('Permission required', 'Please enable background location to use this feature.');
      return;
    }

    // Save the interval if provided
    if (intervalMinutes) {
      await AsyncStorage.setItem(NOTIFICATION_INTERVAL_KEY, intervalMinutes.toString());
    }

    // Get the saved interval or use default
    const savedInterval = await AsyncStorage.getItem(NOTIFICATION_INTERVAL_KEY);
    const interval = savedInterval ? parseInt(savedInterval, 10) : DEFAULT_INTERVAL;

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: interval * 60 * 1000, // Convert minutes to milliseconds
      deferredUpdatesInterval: interval * 60 * 1000, // Same as timeInterval
      deferredUpdatesDistance: 100, // Minimum distance in meters
      foregroundService: {
        notificationTitle: "DEICER is active",
        notificationBody: "Monitoring for nearby activity",
      },
      showsBackgroundLocationIndicator: true,
      activityType: Location.ActivityType.AutomotiveNavigation,
    });
  } catch (error) {
    console.error('Error starting background services:', error);
    Alert.alert('Error', 'Failed to start background services. Please try again.');
  }
};

export const stopBackgroundServices = async () => {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  } catch (error) {
    console.error('Error stopping background services:', error);
  }
};

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Error in background task:', error);
    return;
  }

  if (!data) {
    return;
  }

  const { locations } = data as { locations: Location.LocationObject[] };
  if (!locations || locations.length === 0) {
    return;
  }

  const location = locations[0];
  
  try {
    const { data: markers, error: fetchError } = await supabase
      .rpc('get_nearby_markers', {
        lat: location.coords.latitude,
        long: location.coords.longitude,
        radius_meters: 1000 // 1km radius
      });

    if (fetchError) throw fetchError;

    if (markers && markers.length > 0) {
      // Handle notifications here
    }
  } catch (error) {
    console.error('Error checking for nearby markers:', error);
  }
});