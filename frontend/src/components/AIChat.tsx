import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  ExternalLink,
  Volume2,
  VolumeX,
  Trash2,
  Mic,
  MicOff,
  Radio,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Check
} from 'lucide-react';
import type { ChatMessage, Place, HotelBooking } from '../types';
import { submitChatFeedback } from '../services/api';

interface AIChatProps {
  messages: ChatMessage[];
  loading: boolean;
  activeHotel: HotelBooking | null;
  guestName: string;
  onSendMessage: (msg: string) => void;
  onClearChat: () => void;
  onViewPlaceDetails: (place: Place) => void;
}

export const AIChat: React.FC<AIChatProps> = ({
  messages,
  loading,
  activeHotel,
  guestName,
  onSendMessage,
  onClearChat,
  onViewPlaceDetails,
}) => {
  const [inputText, setInputText] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [listeningInterim, setListeningInterim] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<string, 'positive' | 'negative'>>({});

  const handleChatFeedback = async (messageId: string, feedbackType: 'positive' | 'negative') => {
    setFeedbackState(prev => ({ ...prev, [messageId]: feedbackType }));
    try {
      await submitChatFeedback({
        message_id: messageId,
        feedback_type: feedbackType,
        hotel_id: activeHotel?.id || 'taj-fort-aguada',
      });
    } catch (err) {
      console.error('Failed to submit chat feedback:', err);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const hotelName = activeHotel?.name || 'Taj Fort Aguada Resort & Spa, Goa';
  const hotelArea = activeHotel?.area || 'Sinquerim, Candolim';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, isListening]);

  // Check Speech Recognition capability
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Global auto-read aloud if voiceEnabled
  useEffect(() => {
    if (voiceEnabled && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'assistant' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(lastMsg.text.replace(/[*#•_📍💡💰🍽️⚡]/g, ''));
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        setSpeakingMessageId(lastMsg.id);
        utterance.onend = () => setSpeakingMessageId(null);
        utterance.onerror = () => setSpeakingMessageId(null);
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [messages, voiceEnabled]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loading) return;
    if (isListening) {
      stopListening();
    }
    onSendMessage(inputText.trim());
    setInputText('');
    setListeningInterim('');
  };

  // Speech to Text Controls
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please use Google Chrome or Safari.');
      return;
    }

    try {
      window.speechSynthesis?.cancel();
      setSpeakingMessageId(null);

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Optimally calibrated for Indian English and Goan venues

      recognition.onstart = () => {
        setIsListening(true);
        setListeningInterim('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalTrans = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (finalTrans) {
          setInputText(prev => (prev ? `${prev} ${finalTrans}` : finalTrans).trim());
          setListeningInterim('');
        } else {
          setListeningInterim(interim);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Per-message read aloud toggle
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis audio is not supported in this browser.');
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#•_📍💡💰🍽️⚡]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const sampleQuestions = [
    "Where should I eat tonight?",
    "What beaches are near me?",
    "What can I do near me?",
    "Plan my evening.",
    "Plan a romantic evening.",
    "I have 3 hours free.",
    "Where can I find authentic Goan food?",
    "How do I travel from Candolim to Panjim?",
    "Change my itinerary because of rain.",
    "What should I know before check-in?"
  ];

  return (
    <div className="animate-fade-in" style={{
      maxWidth: '960px',
      margin: '12px auto 0',
    }}>
      {/* Chat Container Box */}
      <div className="glass-card" style={{
        display: 'flex',
        flexDirection: 'column',
        height: '720px',
        overflow: 'hidden',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-card)',
      }}>
        {/* Chat Header */}
        <div style={{
          padding: '16px 20px',
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #D05B3B 0%, #E28445 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(208, 91, 59, 0.3)'
            }}>
              <Bot size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'Playfair Display, serif' }}>YOUR PERSONAL GOA CONCIERGE</span>
                <span style={{ fontSize: '0.74rem', color: '#D05B3B', background: 'rgba(208, 91, 59, 0.12)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  {hotelName}
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                24/7 Grounded Assistant • Origin: {hotelArea} • Proactive Proximity Routing
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => {
                if (voiceEnabled) {
                  window.speechSynthesis?.cancel();
                  setSpeakingMessageId(null);
                }
                setVoiceEnabled(!voiceEnabled);
              }}
              title={voiceEnabled ? "Mute Voice Concierge" : "Auto-Read Responses Aloud"}
              style={{
                background: voiceEnabled ? 'rgba(208, 91, 59, 0.15)' : 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                borderColor: voiceEnabled ? 'var(--accent-primary)' : 'var(--border-primary)',
                color: voiceEnabled ? 'var(--accent-primary)' : 'var(--text-muted)',
                padding: '5px 10px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.76rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease'
              }}
            >
              {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              {voiceEnabled ? 'Auto-Voice On' : 'Voice Off'}
            </button>

            <button
              onClick={() => {
                window.speechSynthesis?.cancel();
                setSpeakingMessageId(null);
                onClearChat();
              }}
              title="Clear Conversation"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-muted)',
                padding: '5px 9px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.76rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Trash2 size={13} /> Clear
            </button>
          </div>
        </div>

        {/* Messages Feed */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                gap: '4px'
              }}
            >
              {/* Message Sender Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                padding: '0 4px'
              }}>
                {msg.sender === 'user' ? (
                  <>
                    <span>{guestName || 'You'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>AI Concierge</span>
                    {msg.isAlert && (
                      <span className="badge-pill badge-terracotta" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                        PROACTIVE ALERT
                      </span>
                    )}
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                    {/* Read Aloud Button */}
                    <button
                      onClick={() => handleToggleSpeak(msg.id, msg.text)}
                      title={speakingMessageId === msg.id ? "Stop Reading" : "Read Aloud"}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: speakingMessageId === msg.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '1px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '0.7rem'
                      }}
                    >
                      {speakingMessageId === msg.id ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                          <Volume2 size={12} className="animate-pulse" /> Speaking...
                        </span>
                      ) : (
                        <Volume2 size={12} />
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Message Bubble */}
              <div
                style={{
                  maxWidth: '82%',
                  padding: '12px 16px',
                  borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: msg.sender === 'user' ? 'var(--accent-secondary)' : 'var(--bg-tertiary)',
                  color: msg.sender === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-primary)',
                  boxShadow: 'var(--shadow-subtle)',
                  fontSize: '0.9rem',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.text}
              </div>

              {/* Tool Execution Trace Badge */}
              {msg.tool_calls && msg.tool_calls.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px',
                  marginTop: '2px',
                  padding: '0 4px'
                }}>
                  {msg.tool_calls.map((tc, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.7rem',
                        background: 'rgba(38, 89, 67, 0.1)',
                        color: 'var(--color-palm-800)',
                        border: '1px solid rgba(38, 89, 67, 0.2)',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        fontFamily: 'monospace'
                      }}
                    >
                      ⚡ executed: {tc.tool}({JSON.stringify(tc.input).slice(0, 45)}...)
                    </span>
                  ))}
                </div>
              )}

              {/* Rich Recommendation Place Cards */}
              {msg.cards && msg.cards.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '10px',
                  marginTop: '8px',
                  width: '100%',
                  maxWidth: '750px'
                }}>
                  {msg.cards.map((place) => (
                    <div
                      key={place.id}
                      className="glass-card card-interactive"
                      style={{
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: 0,
                        border: '1px solid var(--border-primary)',
                      }}
                    >
                      <div style={{ position: 'relative', height: '120px' }}>
                        <img
                          src={place.image_url}
                          alt={place.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <span style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: '6px',
                          background: 'rgba(11, 22, 38, 0.9)',
                          color: '#FFFFFF',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: '2px'
                        }}>
                          📍 {place.distance_from_hotel}
                        </span>
                      </div>

                      <div style={{ padding: '10px 12px' }}>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px' }}>
                          {place.name}
                        </h4>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                          {place.area} • {place.price_range}
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                          {place.description.slice(0, 100)}...
                        </p>
                      </div>

                      <button
                        onClick={() => onViewPlaceDetails(place)}
                        style={{
                          background: 'var(--bg-tertiary)',
                          border: 'none',
                          borderTop: '1px solid var(--border-primary)',
                          padding: '7px 10px',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          color: 'var(--accent-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        Explore <ExternalLink size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Message Micro-Feedback */}
              {msg.sender === 'assistant' && msg.id !== 'welcome-msg' && !msg.isAlert && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '4px',
                  paddingLeft: '4px',
                  fontSize: '0.74rem',
                  color: 'var(--text-muted)'
                }}>
                  {feedbackState[msg.id] ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: feedbackState[msg.id] === 'positive' ? '#10B981' : '#F59E0B',
                      fontWeight: 600
                    }}>
                      <Check size={12} />
                      {feedbackState[msg.id] === 'positive' ? 'Thanks! Glad this was helpful' : 'Thanks for the feedback!'}
                    </span>
                  ) : (
                    <>
                      <span>Was this recommendation helpful?</span>
                      <button
                        onClick={() => handleChatFeedback(msg.id, 'positive')}
                        title="Helpful recommendation"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          transition: 'color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#10B981'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <ThumbsUp size={13} />
                      </button>
                      <button
                        onClick={() => handleChatFeedback(msg.id, 'negative')}
                        title="Needs improvement"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          transition: 'color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <ThumbsDown size={13} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Shimmer Typing Indicator */}
          {loading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 18px',
              borderRadius: '12px 12px 12px 2px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              maxWidth: '360px',
              boxShadow: 'var(--shadow-subtle)'
            }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Concierge is formulating guidance from {hotelName}...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Live Audio Waveform & Speech Recognition Overlay */}
        {isListening && (
          <div style={{
            padding: '12px 18px',
            background: 'var(--bg-tertiary)',
            borderTop: '1px solid var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }} className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              {/* Dancing Waveform Bars */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '24px' }}>
                <div className="wave-bar" />
                <div className="wave-bar" />
                <div className="wave-bar" />
                <div className="wave-bar" />
                <div className="wave-bar" />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  <Radio size={14} className="animate-pulse" />
                  <span>Listening... Speak your question now</span>
                </div>
                {listeningInterim && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontStyle: 'italic', marginTop: '2px' }}>
                    "{listeningInterim}"
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  stopListening();
                  if (inputText.trim()) {
                    handleSend();
                  }
                }}
                className="btn-terracotta"
                style={{ fontSize: '0.78rem', padding: '6px 12px', gap: '4px' }}
              >
                <CheckCircle2 size={13} /> Done Speaking
              </button>

              <button
                type="button"
                onClick={stopListening}
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 10px', gap: '4px' }}
              >
                <XCircle size={13} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Suggested Quick Prompt Chips */}
        <div style={{
          padding: '8px 16px',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-primary)',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', alignSelf: 'center', fontWeight: 600 }}>
            Try:
          </span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(q)}
              disabled={loading}
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-xs)',
                padding: '4px 9px',
                fontSize: '0.74rem',
                color: 'var(--text-secondary)',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '12px 16px',
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border-primary)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}
        >
          {/* Microphone Voice Input Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              title={isListening ? "Stop voice listening" : "Speak to Concierge (Voice Input)"}
              className={isListening ? "recording-pulse" : ""}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid',
                borderColor: isListening ? 'var(--accent-primary)' : 'var(--border-primary)',
                background: isListening ? 'rgba(208, 91, 59, 0.18)' : 'var(--bg-tertiary)',
                color: isListening ? 'var(--accent-primary)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                flexShrink: 0,
              }}
            >
              {isListening ? <MicOff size={18} color="var(--accent-primary)" /> : <Mic size={18} />}
            </button>
          )}

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? "Listening to your voice..."
                : `Ask about dinner near ${hotelArea}, beaches, check-in, or trips...`
            }
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-primary)',
              outline: 'none',
              fontSize: '0.88rem',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)'
            }}
          />

          <button
            type="submit"
            disabled={loading || (!inputText.trim() && !listeningInterim)}
            className="btn-terracotta"
            style={{
              padding: '10px 18px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: loading || (!inputText.trim() && !listeningInterim) ? 0.6 : 1,
              cursor: loading || (!inputText.trim() && !listeningInterim) ? 'not-allowed' : 'pointer'
            }}
          >
            <Send size={15} /> Send
          </button>
        </form>
      </div>
    </div>
  );
};
