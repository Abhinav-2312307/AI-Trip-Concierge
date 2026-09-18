import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, ArrowRight, Volume2, VolumeX, Trash2 } from 'lucide-react';
import type { ChatMessage, Place, HotelBooking } from '../types';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hotelName = activeHotel?.name || 'Taj Fort Aguada Resort & Spa, Goa';
  const hotelArea = activeHotel?.area || 'Sinquerim, Candolim';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (voiceEnabled && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'assistant' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(lastMsg.text.replace(/[*#•]/g, ''));
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [messages, voiceEnabled]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const sampleQuestions = [
    "What's a good place for dinner near me tonight?",
    "What should I know before check-in?",
    "Suggest a beach close to my stay.",
    "What can I do near my hotel?",
    "Plan tomorrow's activities from my hotel."
  ];

  return (
    <div className="animate-fade-in" style={{
      maxWidth: '920px',
      margin: '12px auto 0',
    }}>
      {/* Chat Container Box */}
      <div className="glass-card" style={{
        display: 'flex',
        flexDirection: 'column',
        height: '700px',
        overflow: 'hidden',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-md)',
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
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Bot size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>AI Concierge</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', background: 'rgba(208, 91, 59, 0.1)', padding: '1px 7px', borderRadius: '3px', fontWeight: 600 }}>
                  {hotelName}
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Grounded in Goa knowledge base • Origin: {hotelArea}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              title={voiceEnabled ? "Mute Voice Concierge" : "Enable Voice Concierge"}
              style={{
                background: voiceEnabled ? 'rgba(208, 91, 59, 0.1)' : 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                color: voiceEnabled ? 'var(--accent-primary)' : 'var(--text-muted)',
                padding: '5px 10px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.76rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              {voiceEnabled ? 'Voice On' : 'Voice Off'}
            </button>

            <button
              onClick={onClearChat}
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
                        color: 'var(--color-forest-900)',
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
                      className="glass-card"
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
                        Ask more details <ArrowRight size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              <Sparkles size={16} className="animate-spin" color="var(--accent-primary)" />
              <span>Consulting {hotelName} concierge knowledge base...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

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
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask about dinner near ${hotelArea}, beaches, check-in, or trips...`}
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
            disabled={loading || !inputText.trim()}
            className="btn-terracotta"
            style={{
              padding: '10px 18px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: loading || !inputText.trim() ? 0.6 : 1,
              cursor: loading || !inputText.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            <Send size={15} /> Send
          </button>
        </form>
      </div>
    </div>
  );
};
