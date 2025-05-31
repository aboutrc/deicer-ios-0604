import React, { useState, useEffect, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { AlertTriangle, Mic, MicOff, Loader2, Volume2, MessageSquare, Info } from 'lucide-react';

interface MobileLupeProps {
  language?: 'en' | 'es' | 'zh' | 'hi' | 'ar';
}

const MobileLupe: React.FC<MobileLupeProps> = ({ language = 'en' }) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sanitization function to clean up assistant replies
  const sanitizeAgentText = (raw: string): string => {
    return raw
      .replace(/```(?:[a-z]+)?/gi, '')              // Remove code block markers
      .replace(/\/{1,2}\s*section.*/gi, '')        // Remove weird '/ section' lines
      .replace(/^\/+/gm, '')                       // Remove slashes at beginning of lines
      .replace(/\\n/g, '\n')                     // Convert escaped newlines
      .replace(/\\(.)/g, '$1')                    // Unescape backslashed characters
      .replace(/\s+```/g, '')                      // Remove trailing ```
      .trim();
  };

  const {
    startSession,
    endSession,
    sendUserMessage,
    sendUserActivity,
    messages = [], // Provide default empty array
    isSpeaking,
    status,
    error: conversationError,
    transcript,
  } = useConversation({
    agentId: 'nPjA5PlVWxRd7L1Ypou4',
    onConnect: () => console.log('Connected'),
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
  
  // Function to handle scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const isConnected = status === 'connected';

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (Array.isArray(messages) && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Clear transcription when speaking stops
  useEffect(() => {
    if (!isSpeaking) {
      setTranscription(null);
    }
  }, [isSpeaking]);

  // Handle conversation errors
  useEffect(() => {
    if (conversationError) {
      setError(conversationError.message || 'An error occurred during the conversation');
    } else {
      setError(null);
    }
  }, [conversationError]);

  const handleStart = async () => {
    if (isStarting) return; // Prevent multiple simultaneous start attempts
    
    setError(null);
    try {
      setIsStarting(true);
      
      // Request microphone permission
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        console.error('Microphone access error:', err);
        setError('Microphone permission is required for the conversation.');
        setIsStarting(false);
        return;
      }
      
      // Start the session with a timeout to prevent infinite loading
      const sessionPromise = startSession();
      
      // Set a timeout to prevent hanging in the loading state
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timed out')), 15000);
      });
      
      // Race between successful connection and timeout
      await Promise.race([sessionPromise, timeoutPromise]);
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-0 m-0">
      <div className="w-full space-y-0">
        {/* Introduction text */}
        <div className="text-gray-300 text-sm px-0 py-0">
          <p>
            {language === 'hi' ? (
              <>टिया लूप एक AI सहायक है जिसे{' '}
                <a href="https://lulac.org/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">LULAC</a>{' '}और{' '}
                <a href="https://www.aclu.org/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">ACLU</a>
                {' '}की जानकारी पर प्रशिक्षित किया गया है। वह आपके अधिकारों, आव्रजन प्रक्रियाओं और संयुक्त राज्य अमेरिका में कानूनी सुरक्षा के बारे में प्रश्नों का उत्तर दे सकती है।
              </>
            ) : language === 'ar' ? (
              <>
                تيا لوبي هي مساعدة ذكاء اصطناعي مدربة على معلومات من{' '}
                <a href="https://lulac.org/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  LULAC
                </a>{' '}و{' '}
                <a href="https://www.aclu.org/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  ACLU
                </a>{'. '}يمكنها الإجابة على أسئلة حول حقوقك وعمليات الهجرة والحماية القانونية في الولايات المتحدة.
              </>
            ) : language === 'zh' ? (
              <>
                露佩阿姨是一位人工智能助手，她接受了来自{' '}
                <a href="https://lulac.org/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  LULAC
                </a> 和{' '}
                <a href="https://www.aclu.org/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  ACLU
                </a> 的信息培训。她可以回答关于您的权利、移民程序和在美国的法律保护等问题。
              </>
            ) : language === 'es' ? (
              <>
                Tía Lupe es una asistente de IA entrenada con información de{' '}
                <a href="https://lulac.org/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  LULAC
                </a> y la{' '}
                <a href="https://www.aclu.org/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  ACLU
                </a>. Puede responder preguntas sobre tus derechos, procesos migratorios y protecciones legales en los Estados Unidos.
              </>
            ) : (
              <>
                Tía Lupe is an AI assistant trained on information from{' '}
                <a href="https://lulac.org/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  LULAC
                </a>{' '}and the{' '}
                <a href="https://www.aclu.org/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  ACLU
                </a>. She can answer questions about your rights, immigration processes, and legal protections in the United States.
              </>
            )}
          </p>
        </div>

        <div className="bg-black overflow-hidden border-0">
          {error && (
            <div className="bg-red-900/50 text-red-100 px-4 py-3 flex items-center gap-2">
              <AlertTriangle size={20} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Avatar display */}
          <div className="relative w-full overflow-hidden">
            <img
              src="/lupe_chat1.jpg"
              alt="AI Assistant Avatar"
              className={`w-full object-cover transition-transform duration-300 ${
                isSpeaking ? 'scale-[1.02]' : ''
              }`}
            />
            {/* Live transcription overlay */}
            {transcription && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-3 text-white">
                <div className="flex items-center gap-2">
                  <Volume2 size={16} className="text-blue-400 animate-pulse flex-shrink-0" />
                  <p className="text-sm font-medium">{transcription}</p>
                </div>
              </div>
            )}
          </div>

          {/* Control area with buttons and status indicators */}
          <div className="p-0 flex justify-between items-center bg-gray-900">
            {transcript && transcript.text ? (
              <div className="px-3 py-2 bg-gray-700/50 rounded text-gray-200 text-sm">
                <div className="flex items-center gap-2">
                  <Mic size={14} className="text-blue-400 animate-pulse flex-shrink-0" />
                  <p className="font-medium">{transcript.text}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center gap-4 w-full">
                  <button
                    onClick={handleStart}
                    disabled={isConnected}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isConnected
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-500'
                    } text-white flex items-center justify-center gap-2`}
                  >
                    {isStarting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Mic size={16} />
                        <span>Start</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={endSession}
                    disabled={!isConnected}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      !isConnected
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-500'
                    } text-white flex items-center justify-center gap-2`}
                  >
                    <MicOff size={16} className="flex-shrink-0" />
                    <span>End</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Example questions */}
        <div className="text-gray-300 space-y-1 px-0 py-0">
          <ul className="list-disc pl-6 space-y-1 text-sm">
            {[
              { en: 'What are my rights if ICE comes to my door?',
                es: '¿Cuáles son mis derechos si ICE viene a mi puerta?',
                zh: '如果移民局来敲我的门，我有什么权利？',
                hi: 'अगर ICE मेरे दरवाजे पर आता है तो मेरे क्या अधिकार हैं?',
                ar: 'ما هي حقوقي إذا جاء ICE إلى بابي؟'
              },
              { en: 'Do I have to show identification to police?',
                es: '¿Tengo que mostrar identificación a la policía?',
                zh: '我必须向警察出示身份证明吗？',
                hi: 'क्या मुझे पुलिस को पहचान पत्र दिखाना होगा?',
                ar: 'هل يجب علي إظهار الهوية للشرطة؟'
              },
              { en: 'What is the difference between a warrant and an ICE order?',
                es: '¿Cuál es la diferencia entre una orden judicial y una orden de ICE?',
                zh: '法院搜查令和移民局命令有什么区别？',
                hi: 'वारंट और ICE आदेश के बीच क्या अंतर है?',
                ar: 'ما هو الفرق بين أمر التفتيش وأمر ICE؟'
              },
              { en: 'What should I do if I\'m detained?',
                es: '¿Qué debo hacer si soy detenido?',
                zh: '如果我被拘留了该怎么办？',
                hi: 'अगर मुझे हिरासत में लिया जाता है तो मुझे क्या करना चाहिए?',
                ar: 'ماذا يجب أن أفعل إذا تم احتجازي؟'
              }
            ].map((item, index) => {
              const text = language === 'hi' ? item.hi :
                          language === 'zh' ? item.zh : 
                          language === 'es' ? item.es : 
                          language === 'ar' ? item.ar :
                          item.en;
              return (
                <li key={index}>{text}</li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MobileLupe;