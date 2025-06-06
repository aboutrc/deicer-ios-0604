import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Dimensions,
  Linking
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useConversation } from '@elevenlabs/react';
import { Send, Mic, MicOff, Volume2, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useLanguage } from '@/context/LanguageContext';

// Hardcoded translations for each language
const translations = {
  ar: {
    welcomeMessage: 'تيا لوبي هي مساعدة ذكاء اصطناعي مدربة على معلومات من LULAC و ACLU. يمكنها الإجابة على أسئلة حول حقوقك وعمليات الهجرة والحماية القانونية في الولايات المتحدة.',
    commonQuestions: [
      'ما هي حقوقي إذا جاء ICE إلى بابي؟',
      'هل يجب علي إظهار الهوية للشرطة؟',
      'ما هو الفرق بين أمر التفتيش وأمر ICE؟',
      'ماذا يجب أن أفعل إذا تم احتجازي؟'
    ]
  },
  zh: {
    welcomeMessage: '露佩阿姨是一位人工智能助手，她接受了来自 LULAC 和 ACLU 的信息培训。她可以回答关于您的权利、移民程序和在美国的法律保护等问题。',
    commonQuestions: [
      '如果移民局来敲我的门，我有什么权利？',
      '我必须向警察出示身份证明吗？',
      '法院搜查令和移民局命令有什么区别？',
      '如果我被拘留了该怎么办？'
    ]
  },
  hi: {
    welcomeMessage: 'टिया लूप एक AI सहायक है जिसे LULAC और ACLU की जानकारी पर प्रशिक्षित किया गया है। वह आपके अधिकारों, आव्रजन प्रक्रियाओं और संयुक्त राज्य अमेरिका में कानूनी सुरक्षा के बारे में प्रश्नों का उत्तर दे सकती है।',
    commonQuestions: [
      'अगर ICE मेरे दरवाजे पर आता है तो मेरे क्या अधिकार हैं?',
      'क्या मुझे पुलिस को पहचान पत्र दिखाना होगा?',
      'वारंट और ICE आदेश के बीच क्या अंतर है?',
      'अगर मुझे हिरासत में लिया जाता है तो मुझे क्या करना चाहिए?'
    ]
  },
  es: {
    welcomeMessage: 'Tía Lupe es una asistente de IA entrenada con información de LULAC y la ACLU. Puede responder preguntas sobre tus derechos, procesos migratorios y protecciones legales en los Estados Unidos.',
    commonQuestions: [
      '¿Cuáles son mis derechos si ICE viene a mi puerta?',
      '¿Tengo que mostrar identificación a la policía?',
      '¿Cuál es la diferencia entre una orden judicial y una orden de ICE?',
      '¿Qué debo hacer si soy detenido?'
    ]
  }
};

export default function Chat2Screen() {
  const { language } = useLanguage();

  if (Platform.OS !== 'web') {
    const webAppUrl = `https://deicer.org/mob?lang=${language}`;
    
    return (
      <View style={styles.container}>
        <WebView
          source={{ uri: webAppUrl }}
          style={styles.webview}
          onNavigationStateChange={(navState) => {
            // Handle external links
            if (!navState.url.startsWith('https://deicer.org')) {
              Linking.openURL(navState.url);
              return false;
            }
            return true;
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          bounces={false}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#60A5FA" />
              <Text style={styles.loadingText}>Loading chat...</Text>
            </View>
          )}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error:', nativeEvent);
          }}
        />
      </View>
    );
  }

  const [textInput, setTextInput] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [autoStartAttempted, setAutoStartAttempted] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t, currentAgent } = useLanguage();
  const scrollViewRef = useRef(null);

  // Get the correct translations based on language
  const getTranslation = () => {
    return translations[language] || translations.es;
  };

  const {
    startSession,
    endSession,
    sendUserMessage,
    sendUserActivity,
    messages = [],
    isSpeaking,
    status,
    error: conversationError,
    transcript,
  } = useConversation({
    agentId: currentAgent.id,
    onConnect: () => {
      console.log('Connected');
    },
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (msg) => console.log('Message:', msg),
    onError: (err) => {
      console.error('Conversation error:', err);
      setIsStarting(false);
      setError(err.message || 'An error occurred during the conversation');
    },
    onTranscript: (text) => {
      console.log('Transcript:', text);
      setTranscription(text);
    },
  });

  const isConnected = status === 'connected';

  useEffect(() => {
    if (!autoStartAttempted) {
      const timer = setTimeout(() => {
        handleStart();
      }, 500);
      setAutoStartAttempted(true);
      
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (Array.isArray(messages) && messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    if (!isSpeaking) {
      setTranscription(null);
    }
  }, [isSpeaking]);

  useEffect(() => {
    if (conversationError) {
      setError(conversationError.message || 'An error occurred during the conversation');
    } else {
      setError(null);
    }
  }, [conversationError]);

  const handleStart = async () => {
    if (isStarting) return;
    
    setError(null);
    try {
      setIsStarting(true);
      
      const sessionPromise = startSession();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timed out')), 15000);
      });
      
      await Promise.race([sessionPromise, timeoutPromise]);
      
      // Send initial message after successful connection
      if (isConnected) {
        await sendUserMessage('Hello');
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSendText = async () => {
    if (!textInput.trim() || !isConnected) return;

    try {
      await sendUserMessage(textInput);
      setTextInput('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.imageContainer}>
        <Image
          source={currentAgent.image}
          style={[
            styles.agentImage,
            isSpeaking && styles.agentImageSpeaking
          ]}
        />
        
        {/* Status indicators */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusIndicator,
            isConnected ? styles.statusConnected : styles.statusDisconnected
          ]}>
            <Text style={styles.statusText}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
          
          <View style={[
            styles.statusIndicator,
            isSpeaking ? styles.statusSpeaking : styles.statusSilent
          ]}>
            <Text style={styles.statusText}>
              {isSpeaking ? 'Speaking' : 'Silent'}
            </Text>
          </View>
        </View>

        {/* Live transcription overlay */}
        {transcription && (
          <View style={styles.transcriptionOverlay}>
            <Volume2 size={16} color="#60A5FA" />
            <Text style={styles.transcriptionText}>{transcription}</Text>
          </View>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <AlertTriangle size={20} color="#FCA5A5" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {Array.isArray(messages) && messages.length === 0 && !isConnected && !isStarting && (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              {getTranslation().welcomeMessage}
            </Text>
            <View style={styles.commonQuestions}>
              {getTranslation().commonQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.questionButton}
                  onPress={() => {
                    if (isConnected) {
                      sendUserMessage(question);
                    }
                  }}
                >
                  <Text style={styles.questionText}>{question}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {isStarting && !isConnected && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#60A5FA" />
            <Text style={styles.loadingText}>Connecting...</Text>
          </View>
        )}
        
        {isConnected && Array.isArray(messages) && messages.length === 0 && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              Hello! How can I help you today?
            </Text>
          </View>
        )}

        {Array.isArray(messages) && messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              msg.role === 'user' ? styles.userMessage : styles.agentMessage
            ]}
          >
            <Text style={styles.messageText}>{msg.content}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={textInput}
          onChangeText={(text) => {
            setTextInput(text);
            if (isConnected) sendUserActivity();
          }}
          placeholder="Type your message..."
          placeholderTextColor="#6B7280"
          multiline
          onSubmitEditing={handleSendText}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!textInput.trim() || !isConnected) && styles.sendButtonDisabled
          ]}
          onPress={handleSendText}
          disabled={!textInput.trim() || !isConnected}
        >
          <Send size={20} color={!textInput.trim() || !isConnected ? '#6B7280' : '#FFFFFF'} />
        </TouchableOpacity>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, isConnected && styles.controlButtonDisabled]}
          onPress={handleStart}
          disabled={isConnected}
        >
          {isStarting ? (
            <ActivityIndicator size="small\" color="#FFFFFF" />
          ) : (
            <Mic size={24} color={isConnected ? '#6B7280' : '#FFFFFF'} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, !isConnected && styles.controlButtonDisabled]}
          onPress={endSession}
          disabled={!isConnected}
        >
          <MicOff size={24} color={!isConnected ? '#6B7280' : '#FFFFFF'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  agentImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  agentImageSpeaking: {
    transform: [{ scale: 1.02 }],
  },
  statusContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'column',
    gap: 8,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  statusConnected: {
    backgroundColor: '#059669',
  },
  statusDisconnected: {
    backgroundColor: '#DC2626',
  },
  statusSpeaking: {
    backgroundColor: '#2563EB',
  },
  statusSilent: {
    backgroundColor: '#4B5563',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  transcriptionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transcriptionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  errorContainer: {
    backgroundColor: '#7F1D1D',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  messagesContent: {
    padding: 16,
    gap: 8,
    backgroundColor: '#000000',
  },
  welcomeContainer: {
    padding: 16,
    backgroundColor: '#1F2937',
    borderRadius: 12,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'left',
    marginBottom: 16,
    lineHeight: 24,
  },
  commonQuestions: {
    marginTop: 16,
  },
  questionButton: {
    backgroundColor: '#2C2C2E',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563EB',
  },
  agentMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1F2937',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter-Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  input: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#1F2937',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonDisabled: {
    backgroundColor: '#1F2937',
  },
});