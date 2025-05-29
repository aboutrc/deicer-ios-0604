import { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Share,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Calendar, Clock, Share2, Flag, TriangleAlert as AlertTriangle, MessageCircle } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { getEventById } from '@/services/eventService';
import { Event } from '@/types';

export default function EventDetailsScreen() {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const params = useLocalSearchParams();
  const eventId = params.id as string;
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const data = await getEventById(eventId);
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event details:', error);
      setError(t('errorFetchingEventDetails'));
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!event) return;
    
    try {
      await Share.share({
        title: event.title,
        message: `${event.title} - ${event.description}\n${t('location')}: ${event.location}\n${t('date')}: ${event.date} ${event.time}`,
      });
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };

  const handleReport = () => {
    Alert.alert(
      t('reportEvent'),
      t('reportEventConfirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('report'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(t('thankYou'), t('reportSubmitted'));
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.errorContainer}>
        <AlertTriangle size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error || t('eventNotFound')}</Text>
        <TouchableOpacity style={styles.backButtonLarge} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>{t('goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('eventDetails')}</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Share2 size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.eventHeaderContainer}>
          <View style={styles.eventTypeBadge}>
            <Text style={styles.eventTypeText}>{event.type || t('incident')}</Text>
          </View>
          <Text style={styles.eventTitle}>{event.title}</Text>
          
          <View style={styles.infoRow}>
            <MapPin size={18} color="#8E8E93" />
            <Text style={styles.infoText}>{event.location}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Calendar size={18} color="#8E8E93" />
            <Text style={styles.infoText}>{event.date}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Clock size={18} color="#8E8E93" />
            <Text style={styles.infoText}>{event.time}</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('description')}</Text>
          <Text style={styles.descriptionText}>{event.description}</Text>
        </View>

        {event.updates && event.updates.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('updates')}</Text>
            {event.updates.map((update, index) => (
              <View key={index} style={styles.updateItem}>
                <View style={styles.updateHeader}>
                  <Text style={styles.updateTime}>{update.timestamp}</Text>
                </View>
                <Text style={styles.updateText}>{update.text}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.commentButton}>
            <MessageCircle size={20} color="#007AFF" />
            <Text style={styles.commentButtonText}>{t('addComment')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
            <Flag size={20} color="#FF3B30" />
            <Text style={styles.reportButtonText}>{t('reportInaccuracy')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimerContainer}>
          <AlertTriangle size={16} color="#8E8E93" />
          <Text style={styles.disclaimerText}>{t('eventDisclaimerText')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    color: '#000',
  },
  shareButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  eventHeaderContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eventTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFE8E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  eventTypeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#FF3B30',
  },
  eventTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#000',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#3A3A3C',
    marginLeft: 8,
  },
  sectionContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    color: '#000',
    marginBottom: 12,
  },
  descriptionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#3A3A3C',
  },
  updateItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  updateTime: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#8E8E93',
  },
  updateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#3A3A3C',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  commentButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  reportButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FF3B30',
    marginLeft: 8,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 8,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 20,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButtonLarge: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFF',
  },
});