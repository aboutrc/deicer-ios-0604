import { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Calendar, Clock, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2 } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import * as Location from 'expo-location';
import { submitEvent } from '@/services/eventService';

export default function ReportScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(status === 'granted');
  };

  const getCurrentLocation = async () => {
    if (!locationPermission) {
      Alert.alert(
        t('locationPermissionRequired'),
        t('locationPermissionRequiredDesc'),
        [
          { text: t('cancel'), style: 'cancel' },
          { 
            text: t('settings'), 
            onPress: () => Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings() 
          }
        ]
      );
      return;
    }

    try {
      setLoading(true);
      const { coords } = await Location.getCurrentPositionAsync({});
      const addresses = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude
      });

      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        const locationString = `${address.street || ''} ${address.city || ''}, ${address.region || ''} ${address.postalCode || ''}`.trim();
        setLocation(locationString);
      }
    } catch (error) {
      Alert.alert(t('error'), t('couldNotGetLocation'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    
    // Format date as MM/DD/YYYY
    const dateStr = now.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
    
    // Format time as HH:MM AM/PM
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    setDate(dateStr);
    setTime(timeStr);
  };

  const handleSubmit = async () => {
    if (!title || !description || !location || !date || !time) {
      Alert.alert(t('error'), t('allFieldsRequired'));
      return;
    }

    try {
      setLoading(true);
      
      // In a real app, we would get the actual coordinates from the location string
      // For this demo, we'll use a mock submission
      await submitEvent({
        title,
        description,
        location,
        date,
        time,
        // These would be derived from the location string in a real app
        latitude: 37.7749,
        longitude: -122.4194
      });
      
      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setLocation('');
        setDate('');
        setTime('');
        setSuccess(false);
      }, 3000);
      
    } catch (error) {
      Alert.alert(t('error'), t('failedToSubmitReport'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <CheckCircle2 size={60} color="#34C759" />
        <Text style={styles.successText}>{t('reportSubmittedSuccessfully')}</Text>
        <Text style={styles.successSubtext}>{t('thankYouForReporting')}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{t('reportEvent')}</Text>
          <Text style={styles.headerSubtitle}>{t('provideDetailsBelow')}</Text>
        </View>

        <View style={styles.formContainer}>
          <CustomInput
            label={t('title')}
            placeholder={t('enterTitle')}
            value={title}
            onChangeText={setTitle}
          />

          <CustomInput
            label={t('description')}
            placeholder={t('enterDescription')}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <View style={styles.locationContainer}>
            <CustomInput
              label={t('location')}
              placeholder={t('enterLocation')}
              value={location}
              onChangeText={setLocation}
              icon="map-pin"
            />
            <TouchableOpacity 
              style={styles.currentLocationButton}
              onPress={getCurrentLocation}
              disabled={loading}
            >
              <MapPin size={16} color="#007AFF" />
              <Text style={styles.currentLocationText}>{t('current')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <CustomInput
                label={t('date')}
                placeholder="MM/DD/YYYY"
                value={date}
                onChangeText={setDate}
                icon="calendar"
              />
            </View>
            <View style={styles.halfInput}>
              <CustomInput
                label={t('time')}
                placeholder="HH:MM AM/PM"
                value={time}
                onChangeText={setTime}
                icon="clock"
              />
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.currentTimeButton}
            onPress={getCurrentDateTime}
          >
            <Clock size={16} color="#007AFF" />
            <Text style={styles.currentTimeText}>{t('useCurrentDateTime')}</Text>
          </TouchableOpacity>

          <View style={styles.noteContainer}>
            <AlertTriangle size={16} color="#FF9500" />
            <Text style={styles.noteText}>{t('reportAccuratelyNote')}</Text>
          </View>

          <CustomButton
            title={loading ? t('submitting') : t('submitReport')}
            onPress={handleSubmit}
            disabled={loading}
            loading={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    color: '#000',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#8E8E93',
  },
  formContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  locationContainer: {
    position: 'relative',
  },
  currentLocationButton: {
    position: 'absolute',
    right: 8,
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  currentLocationText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  currentTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 16,
    padding: 4,
  },
  currentTimeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF9ED',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  noteText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#8A6D3B',
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 20,
  },
  successText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
  },
  successSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});