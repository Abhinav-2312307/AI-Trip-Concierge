import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, MapPin, ArrowRight, Volume2, VolumeX, Trash2 } from 'lucide-react';
import type { ChatMessage, Place } from '../types';

interface AIChatProps {
  messages: ChatMessage[];
  loading: boolean;
  onSendMessage: (msg: string) => void;
  onClearChat: () => void;
  onViewPlaceDetails: (place: Place) => void;
}

export const AIChat: React.FC<AIChatProps> = ({
  messages,
  loading,
  onSendMessage,
  onClearChat,
  onViewPlaceDetails,
}) => {
  const [inputText, setInputText] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    "Suggest a chill beach for tomorrow morning.",
    "What can I do near Anjuna this evening?",
    "How can I travel from Baga to Panjim?",
    "Plan a romantic evening for me."
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
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-md)',
      }}>
        {/* Chat Header */}
        <div style={{
          padding: '16px 20px',
          background: 'var(--color-ocean-900)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--color-terracotta-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Bot size={19} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 600 }}>
                Taj Hotel Concierge Assistant
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Grounded in Goa knowledge base • Origin: Taj Fort Aguada, Sinquerim
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              title={voiceEnabled ? "Mute Voice Concierge" : "Enable Voice Concierge"}
              style={{
                background: voiceEnabled ? 'rgba(208, 91, 59, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: voiceEnabled ? '#FDBA74' : '#CBD5E1',
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
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#CBD5E1',
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
          background: 'var(--color-sand-50)',
        }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '10px',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
              }}
            >
              {msg.sender === 'assistant' && (
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--color-ocean-900)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}>
                  <Bot size={16} color="#E28445" />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                {/* Tool Execution Badges */}
                {msg.tool_calls && msg.tool_calls.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {msg.tool_calls.map((tc, idx) => (
                      <span key={idx} style={{
                        background: '#EDF3FA',
                        border: '1px solid #D1E1F3',
                        color: '#1E3A63',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.72rem',
                        fontWeight: 500,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        Tool: <code>{tc.tool}</code>({JSON.stringify(tc.input).slice(0, 28)}...)
                      </span>
                    ))}
                  </div>
                )}

                {/* Message Bubble */}
                <div style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-sm)',
                  background: msg.sender === 'user' ? 'var(--color-ocean-900)' : '#FFFFFF',
                  color: msg.sender === 'user' ? '#FFFFFF' : '#101F35',
                  boxShadow: 'var(--shadow-subtle)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--card-border)',
                  fontSize: '0.9rem',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.text}
                </div>

                {/* Rich Recommendation Cards */}
                {msg.cards && msg.cards.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: msg.cards.length > 1 ? 'repeat(auto-fit, minmax(220px, 1fr))' : '1fr',
                    gap: '10px',
                    marginTop: '4px'
                  }}>
                    {msg.cards.map((card) => (
                      <div
                        key={card.id}
                        className="glass-card"
                        style={{
                          overflow: 'hidden',
                          borderRadius: 'var(--radius-sm)',
                          background: '#FFFFFF',
                          border: '1px solid var(--card-border)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ position: 'relative', height: '115px' }}>
                          <img
                            src={card.image_url}
                            alt={card.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <span style={{
                            position: 'absolute',
                            top: '6px',
                            left: '6px',
                            background: 'rgba(11, 22, 38, 0.85)',
                            color: '#FFFFFF',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '2px',
                            textTransform: 'uppercase'
                          }}>
                            {card.category}
                          </span>
                          <span style={{
                            position: 'absolute',
                            bottom: '6px',
                            right: '6px',
                            background: 'rgba(255, 255, 255, 0.95)',
                            color: '#101F35',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '2px'
                          }}>
                            {card.distance_from_hotel}
                          </span>
                        </div>

                        <div style={{ padding: '12px' }}>
                          <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#101F35', marginBottom: '2px' }}>
                            {card.name}
                          </h4>
                          <div style={{ fontSize: '0.76rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                            <MapPin size={10} color="#D05B3B" /> {card.area} • {card.cuisine || card.price_range}
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4, marginBottom: '10px' }}>
                            {card.description.slice(0, 95)}...
                          </p>

                          <button
                            onClick={() => onViewPlaceDetails(card)}
                            className="btn-primary"
                            style={{
                              width: '100%',
                              fontSize: '0.76rem',
                              padding: '6px 8px',
                              borderRadius: 'var(--radius-xs)'
                            }}
                          >
                            Explore Spot <ArrowRight size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Timestamp */}
                <div style={{
                  fontSize: '0.7rem',
                  color: '#94A3B8',
                  paddingLeft: '2px'
                }}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--color-terracotta-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}>
                  <User size={16} color="#FFFFFF" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start', alignItems: 'center' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--color-ocean-900)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={16} color="#E28445" />
              </div>
              <div style={{
                padding: '10px 14px',
                background: '#FFFFFF',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--card-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.84rem',
                color: '#64748B'
              }}>
                <Sparkles size={14} color="#D05B3B" className="animate-spin" />
                <span>Checking local knowledge base...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
        <div style={{
          padding: '8px 16px',
          background: 'var(--color-sand-100)',
          borderTop: '1px solid var(--card-border)',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center' }}>
            Quick Prompts:
          </span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(q)}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-xs)',
                padding: '3px 10px',
                fontSize: '0.76rem',
                color: '#334155',
                cursor: 'pointer',
                transition: 'all 0.12s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-terracotta-500)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--card-border)')}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '14px 16px',
            background: '#FFFFFF',
            borderTop: '1px solid var(--card-border)',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask your concierge about dining, beaches, transport, or trip ideas..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--card-border)',
              fontSize: '0.9rem',
              outline: 'none',
              background: 'var(--color-sand-50)',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-ocean-900)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--card-border)';
            }}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="btn-terracotta"
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-xs)',
              opacity: !inputText.trim() || loading ? 0.6 : 1,
              cursor: !inputText.trim() || loading ? 'not-allowed' : 'pointer'
            }}
          >
            <Send size={15} /> Send
          </button>
        </form>
      </div>
    </div>
  );
};
