import { useState, useEffect, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { AlertTriangle, Send, Phone, PhoneOff, MicOff as MicMute, Loader2, MessageSquare, Volume2 } from 'lucide-react';

const StandaloneAgent = () => {
  const [textInput, setTextInput] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcription, setTranscription] = useState(null);
  const [error, setError] = useState(null);

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
    agentId: 'agent_01jwes334vfmvakwk5rpbxwtkd',
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (msg) => console.log('Message:', msg),
    onError: (err) => {
      console.error('Conversation error:', err);
      setIsStarting(false);
      setError(err.message || 'An error occurred during the conversation');
    },
    onTranscript: (text) => setTranscription(text),
  });

  const isConnected = status === 'connected';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (Array.isArray(messages) && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (!isSpeaking) setTranscription(null);
  }, [isSpeaking]);

  useEffect(() => {
    if (conversationError) {
      setError(conversationError.message || 'An error occurred');
    } else {
      setError(null);
    }
  }, [conversationError]);

  const handleStart = async () => {
    if (isStarting) return;
    setError(null);
    setIsStarting(true);

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = startSession();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timed out')), 15000)
      );
      await Promise.race([sessionPromise, timeoutPromise]);
    } catch (err) {
      console.error('Error starting session:', err);
      setError(err instanceof Error ? err.message : 'Failed to start');
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
      setError('Failed to send message');
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    // Add mute functionality when available in the SDK
  };

  // JSX for rendering the layout, buttons, and message history omitted for brevity.
};

export default StandaloneAgent;