import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { supabase } from '@/lib/supabase';

const BACKGROUND_FETCH_TASK = 'background-location-task';
const LOCATION_TASK = 'background-location';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
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
            title: 'ICE Activity Reported Nearby',
            body: `ICE activity reported ${marker.distance.toFixed(1)} miles from your location`,
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

export async function startBackgroundServices() {
  try {
    // Request permissions
    const { status: locationStatus } = await Location.requestBackgroundPermissionsAsync();
    const { status: notificationStatus } = await Notifications.requestPermissionsAsync();

    if (locationStatus !== 'granted' || notificationStatus !== 'granted') {
      throw new Error('Required permissions not granted');
    }

    // Register background fetch
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 900, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });

    // Start background location updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 900000, // 15 minutes
      distanceInterval: 100, // 100 meters
      foregroundService: {
        notificationTitle: 'Background Location',
        notificationBody: 'Monitoring for nearby ICE activity',
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to start background services:', error);
    return false;
  }
}

export async function stopBackgroundServices() {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    await Location.stopLocationUpdatesAsync(LOCATION_TASK);
    return true;
  } catch (error) {
    console.error('Failed to stop background services:', error);
    return false;
  }
}