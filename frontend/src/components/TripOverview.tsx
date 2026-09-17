import React, { useState } from 'react';
import { Hotel, Calendar, Utensils, Waves, ShieldCheck, Check, Sparkles, User, Clock, HelpCircle } from 'lucide-react';
import type { TripContext } from '../types';

interface TripOverviewProps {
  tripContext: TripContext | null;
  guestName: string;
  onUpdateGuestName: (name: string) => void;
  onQuickAction: (action: string) => void;
  onGenerateItineraryClick: () => void;
  onSwitchBookingClick: () => void;
}

export const TripOverview: React.FC<TripOverviewProps> = ({
  tripContext,
  guestName,
  onUpdateGuestName,
  onQuickAction,
  onGenerateItineraryClick,
  onSwitchBookingClick,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(guestName);

  const hotel = tripContext?.hotel;
  const weather = tripContext?.weather_summary;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGuestName(nameInput.trim());
    setIsEditingName(false);
  };

  const todayFormatted = tripContext?.current_date_formatted || new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const checkInFormatted = hotel?.check_in_formatted || tripContext?.check_in_formatted || 'Sep 18, 2026';
  const checkOutFormatted = hotel?.check_out_formatted || tripContext?.check_out_formatted || 'Sep 21, 2026';
  const daysUntil = tripContext?.days_until_checkin ?? hotel?.days_until_checkin ?? 1;

  const countdownText = daysUntil === 0 
    ? 'Check-in Today' 
    : (daysUntil === 1 ? 'Starts Tomorrow (1 day to go)' : `Starts in ${daysUntil} days`);

  return (
    <div style={{ marginBottom: '24px' }} className="animate-fade-in">
      {/* Hospitality Booking Banner */}
      <div style={{
        borderRadius: 'var(--radius-md)',
        background: 'linear-gradient(135deg, #101F35 0%, #172D4D 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'var(--shadow-card)',
        padding: '28px 32px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '24px',
        alignItems: 'center'
      }}>
        {/* Left Guest Info */}
        <div style={{ maxWidth: '640px' }}>
          {/* Top Status Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#A7F3D0',
              background: 'rgba(16, 185, 129, 0.12)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <Check size={12} /> {hotel?.status || 'Confirmed Stay'}
            </span>

            <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              Booking Ref: <code style={{ color: '#E2E8F0', fontWeight: 600 }}>{hotel?.confirmation_code || 'CONF-DEMO'}</code>
            </span>

            <span style={{
              fontSize: '0.74rem',
              color: '#FDBA74',
              background: 'rgba(226, 132, 69, 0.15)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600
            }}>
              <Clock size={11} /> {todayFormatted}
            </span>

            <button
              onClick={onSwitchBookingClick}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FDBA74',
                borderRadius: 'var(--radius-xs)',
                padding: '2px 8px',
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
            >
              <Hotel size={11} /> Switch Hotel Booking
            </button>
          </div>

          {/* Active Trip Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <h1 className="font-serif" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.01em', margin: 0 }}>
              {guestName ? `Welcome to Goa, ${guestName}` : 'Welcome to AI Trip Concierge'}
            </h1>
            {!isEditingName && (
              <button
                onClick={() => {
                  setNameInput(guestName);
                  setIsEditingName(true);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#CBD5E1',
                  borderRadius: 'var(--radius-xs)',
                  padding: '3px 9px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
                title={guestName ? "Change Guest Name" : "Enter Your Name"}
              >
                <User size={12} /> {guestName ? "Edit Name" : "Set Your Name"}
              </button>
            )}
          </div>

          {/* Inline Name Editor Form if active */}
          {isEditingName && (
            <form onSubmit={handleSaveName} style={{ display: 'flex', gap: '6px', marginBottom: '12px', alignItems: 'center' }}>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name (e.g. Maya)"
                autoFocus
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.84rem',
                  outline: 'none',
                  minWidth: '200px'
                }}
              />
              <button
                type="submit"
                className="btn-terracotta"
                style={{ padding: '5px 12px', fontSize: '0.78rem' }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </form>
          )}

          {/* Active Trip Indicator Line */}
          <p style={{ fontSize: '0.94rem', color: '#CBD5E1', marginBottom: '16px', lineHeight: 1.5 }}>
            Your active trip: <strong style={{ color: '#FDBA74' }}>{hotel?.name || 'Taj Fort Aguada Resort & Spa, Goa'}</strong> ({hotel?.area || 'Sinquerim, Candolim'}). Access your personalized day-by-day itinerary, ask dining advice, or explore {hotel?.region || 'Goa'}.
          </p>

          {/* Booking Meta Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.82rem',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Hotel size={14} color="#E28445" />
              <span><strong>{hotel?.name || 'Taj Fort Aguada'}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="#E28445" />
              <span>{checkInFormatted} – {checkOutFormatted} ({hotel?.duration || tripContext?.duration || '3 Nights'})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                background: 'rgba(226, 132, 69, 0.25)',
                color: '#FED7AA',
                padding: '2px 7px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.72rem',
                fontWeight: 600
              }}>
                {countdownText}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#A7F3D0" />
              <span>{hotel?.room_type || 'Sea View Luxury Suite'}</span>
            </div>
          </div>
        </div>

        {/* Right Coastal Conditions Box */}
        <div style={{
          minWidth: '220px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px 20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94A3B8', fontWeight: 600 }}>
              Coastal Conditions
            </span>
            <span style={{ fontSize: '0.72rem', color: '#E2E8F0', background: 'rgba(255, 255, 255, 0.1)', padding: '1px 6px', borderRadius: '3px' }}>
              {hotel?.region || 'Goa'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
            <div style={{ fontSize: '2.1rem', fontWeight: 700, color: '#FFFFFF' }}>
              {weather?.temperature_c || 29}°C
            </div>
            <div style={{ fontSize: '0.86rem', color: '#CBD5E1' }}>
              Coastal Breeze
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '8px',
            fontSize: '0.8rem',
            color: '#CBD5E1',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Sunset:</span>
              <strong style={{ color: '#FDE68A' }}>{weather?.sunset_time || '6:28 PM'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>High Tide:</span>
              <span>{weather?.tide_schedule?.high_tide || '5:40 PM'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Chips */}
      <div style={{
        marginTop: '14px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', marginRight: '4px' }}>
          Suggested Inquiries:
        </span>

        <button
          onClick={onGenerateItineraryClick}
          className="btn-terracotta"
          style={{ fontSize: '0.82rem', padding: '6px 14px' }}
        >
          <Sparkles size={13} /> Generate Itinerary
        </button>

        <button
          onClick={() => onQuickAction("What's a good place for dinner near me tonight?")}
          className="btn-secondary"
          style={{ fontSize: '0.82rem', padding: '6px 12px' }}
        >
          <Utensils size={13} color="#D05B3B" /> Dinner Near My Hotel
        </button>

        <button
          onClick={() => onQuickAction("What should I know before check-in?")}
          className="btn-secondary"
          style={{ fontSize: '0.82rem', padding: '6px 12px' }}
        >
          <HelpCircle size={13} color="#10B981" /> Check-in Guide
        </button>

        <button
          onClick={() => onQuickAction("Suggest a beach close to my stay.")}
          className="btn-secondary"
          style={{ fontSize: '0.82rem', padding: '6px 12px' }}
        >
          <Waves size={13} color="#2C5282" /> Beach Close to Stay
        </button>

        <button
          onClick={() => onQuickAction("What can I do near my hotel?")}
          className="btn-secondary"
          style={{ fontSize: '0.82rem', padding: '6px 12px' }}
        >
          Activities Near Hotel
        </button>

        <button
          onClick={() => onQuickAction("Plan a romantic evening for me.")}
          className="btn-secondary"
          style={{ fontSize: '0.82rem', padding: '6px 12px' }}
        >
          Romantic Evening Plan
        </button>
      </div>
    </div>
  );
};
