import { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView
} from 'react-native';
import { Audio } from 'expo-av';
import { 
  Play, 
  Square,
  Volume2
} from 'lucide-react-native';
import { useLanguage } from '@/context/LanguageContext';

// Static mapping of audio assets
const audioAssets = {
  'recording-notification': require('@/assets/audio/recording-notification.mp3'),
  'constitutional-rights': require('@/assets/audio/constitutional-rights.mp3'),
  'no-search-permission': require('@/assets/audio/no-search-permission.mp3'),
  'badge-numbers': require('@/assets/audio/badge-numbers.mp3'),
  'free-to-go': require('@/assets/audio/free-to-go.mp3'),
  'goodbye': require('@/assets/audio/goodbye.mp3')
};

interface AudioButton {
  title: string;
  description: string;
  file: string;
}

const audioButtons: AudioButton[] = [
  {
    title: 'recordingNotification',
    description: 'recordingNotificationDesc',
    file: 'recording-notification'
  },
  {
    title: 'constitutionalRights',
    description: 'constitutionalRightsDesc',
    file: 'constitutional-rights'
  },
  {
    title: 'noPermissionToSearch',
    description: 'noPermissionToSearchDesc',
    file: 'no-search-permission'
  },
  {
    title: 'requestBadgeNumbers',
    description: 'requestBadgeNumbersDesc',
    file: 'badge-numbers'
  },
  {
    title: 'freeToGo',
    description: 'freeToGoDesc',
    file: 'free-to-go'
  },
  {
    title: 'goodbye',
    description: 'goodbyeDesc',
    file: 'goodbye'
  }
];

export default function CardScreen() {
  const { t } = useLanguage();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const playAudio = async (fileId: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        allowsRecordingIOS: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false
      });

      const audioAsset = audioAssets[fileId as keyof typeof audioAssets];
      const { sound: newSound } = await Audio.Sound.createAsync(audioAsset, {
        shouldPlay: true,
        volume: 1.0,
      }, (status) => {
        if (status.isLoaded && !status.isPlaying) {
          setCurrentlyPlayingId(null);
        }
      });

      setSound(newSound);
      setCurrentlyPlayingId(fileId);
      
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
      setCurrentlyPlayingId(null);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setCurrentlyPlayingId(null);
        setSound(null);
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t('knowYourRightsCard')}</Text>
        <Text style={styles.subtitle}>{t('quickAccessToRights')}</Text>
      </View>

      <View style={styles.audioButtonsContainer}>
        {audioButtons.map((button, index) => (
          <View key={index} style={styles.audioButton}>
            <View style={styles.audioInfo}>
              <Text style={styles.audioTitle}>{t(button.title)}</Text>
              <Text style={styles.audioDescription}>{t(button.description)}</Text>
            </View>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => {
                if (currentlyPlayingId === button.file) {
                  stopAudio();
                } else {
                  playAudio(button.file);
                }
              }}
            >
              {currentlyPlayingId === button.file ? (
                <Square size={24} color="#FFFFFF" />
              ) : (
                <Play size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-SemiBold',
    color: '#FF3B30',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93'
  },
  audioButtonsContainer: {
    marginBottom: 24,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  audioInfo: {
    flex: 1,
    marginRight: 16,
  },
  audioTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  audioDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    lineHeight: 20,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
});