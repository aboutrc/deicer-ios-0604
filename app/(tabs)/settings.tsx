import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { stopBackgroundServices, startBackgroundServices } from '@/services/backgroundService';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';

const NOTIFICATION_INTERVAL_KEY = 'notification_interval_minutes';
const DEFAULT_INTERVAL = 20; // Default 20 minutes
const MIN_INTERVAL = 5; // Minimum 5 minutes
const MAX_INTERVAL = 60; // Maximum 60 minutes

export default function SettingsScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [notificationInterval, setNotificationInterval] = useState(DEFAULT_INTERVAL);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

  useEffect(() => {
    checkLocationStatus();
    loadNotificationInterval();
  }, []);

  const loadNotificationInterval = async () => {
    try {
      const savedInterval = await AsyncStorage.getItem(NOTIFICATION_INTERVAL_KEY);
      if (savedInterval) {
        setNotificationInterval(parseInt(savedInterval, 10));
      }
    } catch (error) {
      console.error('Failed to load notification interval:', error);
    }
  };

  const checkLocationStatus = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setIsLocationEnabled(status === 'granted');
  };

  const handleDeleteData = async () => {
    Alert.alert(
      'Delete My Data',
      'This will delete all your markers and stop background location services. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await stopBackgroundServices();
              const { error } = await supabase.rpc('delete_user_markers');
              
              if (error) throw error;

              await Location.stopLocationUpdatesAsync('background-location');
              
              Alert.alert(
                'Data Deleted',
                'Your data has been deleted and location services have been stopped. You can re-enable features at any time.'
              );
            } catch (error) {
              console.error('Failed to delete data:', error);
              Alert.alert('Error', 'Failed to delete data. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleIntervalChange = async (minutes: number) => {
    setNotificationInterval(minutes);
    try {
      await AsyncStorage.setItem(NOTIFICATION_INTERVAL_KEY, minutes.toString());
      
      // If location services are enabled, restart them with new interval
      if (isLocationEnabled) {
        await stopBackgroundServices();
        await startBackgroundServices(minutes);
        Alert.alert(
          'Settings Updated',
          `Notification interval has been updated to ${minutes} minutes.`
        );
      }
    } catch (error) {
      console.error('Failed to save notification interval:', error);
      Alert.alert('Error', 'Failed to update notification interval. Please try again.');
    }
  };

  const toggleLocationServices = async () => {
    if (isLocationEnabled) {
      Alert.alert(
        'Disable Location Services',
        'This will stop all location-based features. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            onPress: async () => {
              await stopBackgroundServices();
              setIsLocationEnabled(false);
              Alert.alert('Location Services Disabled', 'You can re-enable them at any time.');
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Enable Location Services',
        'This will allow you to receive alerts about nearby activity.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: async () => {
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status === 'granted') {
                await startBackgroundServices(notificationInterval);
                setIsLocationEnabled(true);
                Alert.alert('Location Services Enabled', 'You will now receive alerts about nearby activity.');
              }
            }
          }
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Settings & Privacy' }} />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Controls</Text>
        <Text style={styles.description}>
          DEICER is designed with privacy in mind. We never collect personal information,
          and your location data is never stored or shared.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Frequency</Text>
        <Text style={styles.description}>
          Control how often DEICER checks for nearby activity. More frequent checks
          may affect battery life.
        </Text>
        <Text style={styles.intervalText}>
          Check every {notificationInterval} minutes
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={MIN_INTERVAL}
          maximumValue={MAX_INTERVAL}
          step={5}
          value={notificationInterval}
          onValueChange={setNotificationInterval}
          onSlidingComplete={handleIntervalChange}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>5 min</Text>
          <Text style={styles.sliderLabel}>60 min</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Services</Text>
        <Text style={styles.description}>
          Control how DEICER uses your location. When disabled, you won't receive alerts
          about nearby activity.
        </Text>
        <Button
          onPress={toggleLocationServices}
          style={styles.button}
          loading={isLoading}
        >
          {isLocationEnabled ? 'Disable Location Services' : 'Enable Location Services'}
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <Text style={styles.description}>
          Delete all your markers and stop location services. This action cannot be undone.
        </Text>
        <Button
          onPress={handleDeleteData}
          variant="destructive"
          style={styles.button}
          loading={isLoading}
        >
          Delete My Data
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Your Privacy</Text>
        <Text style={styles.description}>
          • No personal information is collected{'\n'}
          • No email or phone number required{'\n'}
          • No cookies or tracking{'\n'}
          • No IP address storage{'\n'}
          • Location data is temporary{'\n'}
          • All markers expire automatically{'\n'}
          • You can delete your data anytime
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 22,
  },
  button: {
    marginTop: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  intervalText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#666',
  },
}); 