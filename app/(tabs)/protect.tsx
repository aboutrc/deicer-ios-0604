import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { Mic, MicOff, Volume2, Square, Play } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { useLanguage } from '@/context/LanguageContext';

// Hardcoded translations for each language
const translations = {
  ar: {
    liveTranslation: 'الترجمة الفورية',
    liveTranslationDesc: 'تحدث بالإنجليزية واحصل على ترجمة فورية للعربية',
    startListening: 'ابدأ الاستماع',
    stopListening: 'إيقاف الاستماع',
    preRecordedResponses: 'الردود الصوتية المسجلة مسبقاً',
    preRecordedDesc: 'ضع هاتفك بالقرب من الباب للاستماع وترجمة اللغة الإنجليزية إلى العربية.',
    fifthAmendmentRights: 'حقوق التعديل الخامس',
    fifthAmendmentDesc: 'لا أرغب في التحدث معك، أو الإجابة على أسئلتك، أو التوقيع أو تسليمك أي مستندات، بناءً على حقوقي بموجب التعديل الخامس من دستور الولايات المتحدة.',
    fourthAmendmentRights: 'حقوق التعديل الرابع',
    fourthAmendmentDesc: 'لا أعطيك إذنًا بدخول منزلي، بناءً على حقوقي بموجب التعديل الرابع من دستور الولايات المتحدة، ما لم يكن لديك أمر تفتيش للدخول، موقع من قاضٍ أو قاضي صلح، يحمل اسمي وتمرره تحت الباب.',
    warrantRequest: 'طلب أمر تفتيش',
    warrantRequestDesc: 'يرجى تمرير أمر التفتيش للدخول - موقع من قاضٍ أو قاضي صلح مع اسمي - تحت الباب. إذا لم يكن لديك واحد، فأنا لا أرغب في التحدث معك، أو الإجابة على أسئلتك، أو التوقيع أو تسليمك أي مستندات، بناءً على حقوقي بموجب التعديل الخامس من دستور الولايات المتحدة.',
    searchPermission: 'إذن التفتيش',
    searchPermissionDesc: 'لا أعطيك إذنًا بتفتيش أي من ممتلكاتي بناءً على حقوقي بموجب التعديل الرابع.',
    identifyAuthority: 'تحديد السلطة',
    identifyAuthorityDesc: 'هل يمكنك التعريف بنفسك من فضلك. هل أنت مع جهات إنفاذ القانون المحلية أم مع هيئة الهجرة والجمارك.',
    requestBadgeNumbers: 'أرقام الشارات',
    requestBadgeNumbersDesc: 'أطلب أرقام الشارات من جميع الضباط الحاضرين.'
  },
  zh: {
    liveTranslation: '实时翻译',
    liveTranslationDesc: '用英语说话并获得即时中文翻译',
    startListening: '开始收听',
    stopListening: '停止收听',
    preRecordedResponses: '预录制音频回复',
    preRecordedDesc: '将手机放在门附近，听取并将英语翻译成中文。',
    fifthAmendmentRights: '第五修正案权利',
    fifthAmendmentDesc: '根据美国宪法第五修正案赋予我的权利，我不希望与您交谈，回答您的问题，或签署或交给您任何文件。',
    fourthAmendmentRights: '第四修正案权利',
    fourthAmendmentDesc: '根据美国宪法第四修正案赋予我的权利，我不允许您进入我的家，除非您有由法官或治安法官签署的、写有我名字的搜查令，并将其从门下递进来。',
    warrantRequest: '搜查令请求',
    warrantRequestDesc: '请将由法官或治安法官签署的、写有我名字的进入搜查令从门下递进来。如果您没有，根据美国宪法第五修正案赋予我的权利，我不希望与您交谈，回答您的问题，或签署或交给您任何文件。',
    searchPermission: '搜查许可',
    searchPermissionDesc: '根据我的第四修正案权利，我不允许您搜查我的任何物品。',
    identifyAuthority: '确认执法身份',
    identifyAuthorityDesc: '请问您能否表明身份。您是地方执法人员还是移民与海关执法局人员？',
    requestBadgeNumbers: '警徽号码',
    requestBadgeNumbersDesc: '我要求在场的所有警官提供警徽号码。'
  },
  hi: {
    liveTranslation: 'रीयल-टाइम अनुवाद',
    liveTranslationDesc: 'अंग्रेजी में बोलें और तुरंत हिंदी अनुवाद प्राप्त करें',
    startListening: 'सुनना शुरू करें',
    stopListening: 'सुनना बंद करें',
    preRecordedResponses: 'पूर्व-रिकॉर्ड किए गए ऑडियो उत्तर',
    preRecordedDesc: 'अपने फोन को दरवाजे के पास रखें और अंग्रेजी को हिंदी में सुनें और अनुवाद करें।',
    fifthAmendmentRights: 'पांचवें संशोधन के अधिकार',
    fifthAmendmentDesc: 'मैं अमेरिकी संविधान के तहत अपने पांचवें संशोधन के अधिकारों के आधार पर आपसे बात करना, आपके प्रश्नों का उत्तर देना, या कोई दस्तावेज़ हस्ताक्षरित करना या आपको देना नहीं चाहता हूं।',
    fourthAmendmentRights: 'चौथे संशोधन के अधिकार',
    fourthAmendmentDesc: 'मैं आपको अपने घर में प्रवेश करने की अनुमति नहीं देता हूं, अमेरिकी संविधान के तहत मेरे चौथे संशोधन के अधिकारों के आधार पर, जब तक कि आपके पास प्रवेश करने का वारंट नहीं है, जिस पर न्यायाधीश या मजिस्ट्रेट के हस्ताक्षर हैं, जिस पर मेरा नाम है और जिसे आप दरवाजे के नीचे से फिसला सकते हैं।',
    warrantRequest: 'वारंट अनुरोध',
    warrantRequestDesc: 'कृपया प्रवेश करने के लिए वारंट - न्यायाधीश या मजिस्ट्रेट द्वारा मेरे नाम के साथ हस्ताक्षरित - दरवाजे के नीचे से फिसलाएं। यदि आपके पास नहीं है, तो मैं अमेरिकी संविधान के तहत अपने पांचवें संशोधन के अधिकारों के आधार पर आपसे बात करना, आपके प्रश्नों का उत्तर देना, या कोई दस्तावेज़ हस्ताक्षरित करना या आपको देना नहीं चाहता हूं।',
    searchPermission: 'तलाशी की अनुमति',
    searchPermissionDesc: 'मैं अपने चौथे संशोधन के अधिकारों के आधार पर आपको अपनी किसी भी संपत्ति की तलाशी लेने की अनुमति नहीं देता हूं।',
    identifyAuthority: 'अधिकार की पहचान',
    identifyAuthorityDesc: 'क्या आप कृपया अपनी पहचान बता सकते हैं। क्या आप स्थानीय कानून प्रवर्तन के साथ हैं या आव्रजन और सीमा शुल्क प्रवर्तन के साथ हैं।',
    requestBadgeNumbers: 'बैज नंबर',
    requestBadgeNumbersDesc: 'मैं उपस्थित सभी अधिकारियों से बैज नंबर का अनुरोध करूंगा।'
  }
};


const audioAssets = {
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

const audioButtons: AudioButton[] = [
  {
    title: 'fifthAmendmentRights',
    description: 'fifthAmendmentDesc',
    file: 'myhome-fifth-amendment'
  },
  {
    title: 'fourthAmendmentRights',
    description: 'fourthAmendmentDesc',
    file: 'myhome-fourth-amendment'
  },
  {
    title: 'warrantRequest',
    description: 'warrantRequestDesc',
    file: 'myhome-warrant-request'
  },
  {
    title: 'searchPermission',
    description: 'searchPermissionDesc',
    file: 'myhome-search-permission'
  },
  {
    title: 'identifyAuthority',
    description: 'identifyAuthorityDesc',
    file: 'myhome-identify-authority'
  },
  {
    title: 'requestBadgeNumbers',
    description: 'requestBadgeNumbersDesc',
    file: 'myhome-badge-numbers'
  }
];

export default function ProtectScreen() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [translation, setTranslation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const { t, language } = useLanguage();

  // Get the correct translations based on language
  const getTranslation = (key: string) => {
    if (language === 'en' || language === 'es') {
      return t(key);
    }
    return translations[language]?.[key] || t(key);
  };

  // Get text alignment and direction based on language
  const getTextStyle = () => {
    const isRTL = language === 'ar';
    return {
      textAlign: isRTL ? 'right' : 'left' as 'right' | 'left',
      writingDirection: isRTL ? 'rtl' : 'ltr' as 'rtl' | 'ltr',
      flexDirection: isRTL ? 'row-reverse' : 'row' as 'row-reverse' | 'row',
    };
  };

  // Get target language for translation
  const getTargetLanguage = () => {
    switch (language) {
      case 'zh': return t('chineseText');
      case 'hi': return t('hindiText');
      case 'ar': return t('arabicText');
      case 'es': return t('spanishText');
      default: return t('englishText');
    }
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [sound, recording]);

  const startListening = async () => {
    try {
      setError(null);
      setTranscription(null);
      setTranslation('');
      
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: Audio.InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: Audio.InterruptionModeAndroid.DoNotMix,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsListening(true);
    } catch (err) {
      setError('Failed to start recording');
      console.error('Failed to start recording:', err);
    }
  };

  const stopListening = async () => {
    try {
      if (!recording) return;

      setIsListening(false);
      setIsTranslating(true);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (!uri) {
        throw new Error('No recording URI available');
      }

      // Here you would typically send the audio file to a speech-to-text service
      // For now, we'll simulate the process with a timeout
      setTimeout(() => {
        const simulatedText = "This is a simulated transcription of the recorded audio.";
        setTranscription(simulatedText);
        translateText(simulatedText)
          .then(translatedText => {
            setTranslation(translatedText);
            setIsTranslating(false);
          })
          .catch(err => {
            setError('Translation failed');
            setIsTranslating(false);
          });
      }, 2000);

    } catch (err) {
      setError('Failed to stop recording');
      setIsListening(false);
      setIsTranslating(false);
      console.error('Failed to stop recording:', err);
    }
  };

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
            target: getTargetLanguage(language),
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

  const playAudio = async (audioId: string, buttonId: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(audioAssets[audioId]);
      setSound(newSound);
      setCurrentlyPlayingId(buttonId);
      
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          setCurrentlyPlayingId(null);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setCurrentlyPlayingId(null);
    }
  };

  const stopAudio = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      setCurrentlyPlayingId(null);
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, getTextStyle()]}>{getTranslation('liveTranslation')}</Text>
          <Text style={[styles.sectionDescription, getTextStyle()]}>
            {getTranslation('liveTranslationDesc')}
          </Text>
          
          <TouchableOpacity 
            style={[styles.listenButton, isListening && styles.listenButtonActive]}
            onPress={isListening ? stopListening : startListening}
            disabled={isTranslating}
          >
            {isListening ? (
              <MicOff size={24} color="#FFFFFF" />
            ) : (
              <Mic size={24} color="#FFFFFF" />
            )}
            <Text style={[styles.listenButtonText, getTextStyle()]}>
              {isListening ? getTranslation('stopListening') : getTranslation('startListening')}
            </Text>
            <Text style={[styles.listenButtonText, getTextStyle()]}>
              {isListening ? t('stopListening') : t('startListening')}
            </Text>
          </TouchableOpacity>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, getTextStyle()]}>{error}</Text>
            </View>
          )}

          {(transcription || isTranslating) && (
            <View style={styles.resultsContainer}>
              <View style={styles.transcriptionContainer}>
                <Text style={[styles.resultLabel, getTextStyle()]}>{t('englishText')}</Text>
                {isTranslating && !transcription ? (
                  <ActivityIndicator color="#007AFF" />
                ) : (
                  <Text style={[styles.transcriptionText, getTextStyle()]}>{transcription}</Text>
                )}
              </View>

              <View style={styles.translationContainer}>
                <Text style={[styles.resultLabel, getTextStyle()]}>{getTargetLanguage()}</Text>
                {isTranslating ? (
                  <ActivityIndicator color="#007AFF" />
                ) : (
                  <Text style={[styles.translationText, getTextStyle()]}>{translation}</Text>
                )}
              </View>
            </View>
          )}

          <Text style={[styles.sectionTitle, getTextStyle()]}>{getTranslation('preRecordedResponses')}</Text>
          <Text style={[styles.sectionDescription, getTextStyle()]}>
            {getTranslation('preRecordedDesc')}
          </Text>

          {audioButtons.map((button, index) => (
            <View key={index} style={styles.audioButton}>
              <View style={styles.audioInfo}>
                <Text style={[styles.audioTitle, getTextStyle()]}>{getTranslation(button.title)}</Text>
                <Text style={[styles.audioDescription, getTextStyle()]}>{getTranslation(button.description)}</Text>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
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