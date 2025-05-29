import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { Play, Square, Mic, MicOff } from 'lucide-react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { useLanguage } from '@/context/LanguageContext'; 

const audioFiles = {
  'myhome-fifth-amendment': require('@/assets/audio/myhome-fifth-amendment.mp3'),
  'myhome-fourth-amendment': require('@/assets/audio/myhome-fourth-amendment.mp3'),
  'myhome-warrant-request': require('@/assets/audio/myhome-warrant-request.mp3'),
  'myhome-search-permission': require('@/assets/audio/myhome-search-permission.mp3'),
  'myhome-identify-authority': require('@/assets/audio/myhome-identify-authority.mp3'),
  'myhome-badge-numbers': require('@/assets/audio/myhome-badge-numbers.mp3'),
};

interface AudioButton {
  title: string;
  description: string;
  file: string;
}

export default function ProtectScreen() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [translation, setTranslation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const { t } = useLanguage();

  const translateText = async (text: string): Promise<string> => {
    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY || ''}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: 'en',
            target: 'es',
            format: 'text',
          }),
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  };

  const transcribeAudio = async (uri: string): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'audio/wav',
        name: 'recording.wav',
      } as any);
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY || ''}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return data.text;
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  };

  const startListening = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        t('featureNotAvailable'),
        t('featureNotAvailableDesc'),
        [{ text: 'OK' }]
      );
      return;
    }

    if (!process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY || !process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
      Alert.alert(
        'API Keys Required',
        'Please set up your Google Translate and OpenAI API keys in the .env file.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setError(null);
      setIsListening(true);
      setTranscription('');
      setTranslation('');

      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        throw new Error('Microphone permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 16000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MEDIUM,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 16000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false
        },
      });

      await recording.startAsync();
      
      // Stop recording after 5 seconds
      setTimeout(() => {
        stopListening(recording);
      }, 5000);

    } catch (err) {
      console.error('Failed to start recording', err);
      setError('Failed to start recording. Please check permissions and try again.');
      setIsListening(false);
    }
  };

  const stopListening = async (recording: Audio.Recording) => {
    try {
      await recording.stopAndUnloadAsync();
      setIsListening(false);
      setIsTranslating(true);

      const uri = recording.getURI();
      if (!uri) throw new Error('No recording URI');

      try {
        // Transcribe audio using Whisper API
        const transcribedText = await transcribeAudio(uri);
        setTranscription(transcribedText);

        // Translate text using Google Translate API
        const translatedText = await translateText(transcribedText);
        setTranslation(translatedText);
      } catch (error) {
        console.error('Processing error:', error);
        setError('Failed to process audio. Please try again.');
      } finally {
        setIsTranslating(false);
      }

    } catch (err) {
      console.error('Failed to stop recording', err);
      setError('Failed to stop recording. Please try again.');
      setIsListening(false);
      setIsTranslating(false);
    }
  };

  const audioButtons: AudioButton[] = [
    {
      title: t('fifthAmendmentRights'),
      description: t('fifthAmendmentDesc'),
      file: 'myhome-fifth-amendment'
    },
    {
      title: t('fourthAmendmentRights'),
      description: t('fourthAmendmentDesc'),
      file: 'myhome-fourth-amendment'
    },
    {
      title: t('warrantRequest'),
      description: t('warrantRequestDesc'),
      file: 'myhome-warrant-request'
    },
    {
      title: t('searchPermission'),
      description: t('searchPermissionDesc'),
      file: 'myhome-search-permission'
    },
    {
      title: t('identifyAuthority'),
      description: t('identifyAuthorityDesc'),
      file: 'myhome-identify-authority'
    },
    {
      title: t('requestBadgeNumbers'),
      description: t('requestBadgeNumbersDesc'),
      file: 'myhome-badge-numbers'
    }
  ];

  useEffect(() => {
    return () => {
      if (sound) {
        const cleanup = async () => {
          try {
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
              await sound.unloadAsync();
            }
          } catch (error) {
            console.log('Cleanup error:', error);
          }
        };
        cleanup();
      }
    };
  }, [sound]);

  const playAudio = async (fileId: string, id: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        allowsRecordingIOS: false,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      });

      const audioAsset = audioFiles[fileId as keyof typeof audioFiles];
      const { sound: newSound } = await Audio.Sound.createAsync(audioAsset, {
        shouldPlay: true,
        volume: 1.0,
      }, (status) => {
        if (status.isLoaded) {
          if (!status.isPlaying && !status.didJustFinish) {
            setIsPlaying(false);
            setCurrentlyPlayingId(null);
          }
          if (status.didJustFinish) {
            setIsPlaying(false);
            setCurrentlyPlayingId(null);
          }
        }
      });

      setSound(newSound);
      setIsPlaying(true);
      setCurrentlyPlayingId(id);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setCurrentlyPlayingId(null);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setIsPlaying(false);
        setCurrentlyPlayingId(null);
        setSound(null);
      } catch (error) {
        console.error('Error stopping audio:', error);
        setIsPlaying(false);
        setCurrentlyPlayingId(null);
        setSound(null);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.mainContent}>
        <Text style={styles.sectionTitle}>{t('liveTranslation')}</Text>
        <Text style={styles.sectionDescription}>{t('liveTranslationDesc')}</Text>
        
        <TouchableOpacity 
          style={[styles.listenButton, isListening && styles.listenButtonActive]}
          onPress={startListening}
          disabled={isListening || isTranslating}
        >
          {isListening ? (
            <MicOff size={24} color="#FFFFFF" />
          ) : (
            <Mic size={24} color="#FFFFFF" />
          )}
          <Text style={styles.listenButtonText}>
            {isListening ? t('stopListening') : t('startListening')}
          </Text>
        </TouchableOpacity>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {(transcription || isTranslating) && (
          <View style={styles.resultsContainer}>
            <View style={styles.transcriptionContainer}>
              <Text style={styles.resultLabel}>{t('englishText')}</Text>
              {isTranslating && !transcription ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <Text style={styles.transcriptionText}>{transcription}</Text>
              )}
            </View>

            <View style={styles.translationContainer}>
              <Text style={styles.resultLabel}>{t('spanishText')}</Text>
              {isTranslating ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <Text style={styles.translationText}>{translation}</Text>
              )}
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>{t('preRecordedResponses')}</Text>
        <Text style={styles.sectionDescription}>{t('preRecordedDesc')}</Text>

        {audioButtons.map((button, index) => (
          <View key={index} style={styles.audioButton}>
            <View style={styles.audioInfo}>
              <Text style={styles.audioTitle}>{button.title}</Text>
              <Text style={styles.audioDescription}>{button.description}</Text>
            </View>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => {
                if (currentlyPlayingId === button.file) {
                  stopAudio();
                } else {
                  playAudio(button.file, button.file);
                }
              }}
            >
              {currentlyPlayingId === button.file ? (
                <Square size={24} color="#FF3B30" />
              ) : (
                <Play size={24} color="#007AFF" />
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
    paddingBottom: 20,
  },
  mainContent: {
    padding: 16,
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  listenButtonActive: {
    backgroundColor: '#FF3B30',
  },
  listenButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: '#3A1C1C',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  resultsContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  transcriptionContainer: {
    marginBottom: 16,
  },
  translationContainer: {
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingTop: 16,
  },
  resultLabel: {
    color: '#8E8E93',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  transcriptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  translationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 16,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
});