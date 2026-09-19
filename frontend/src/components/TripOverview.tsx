import React, { useState } from 'react';
import { 
  ArrowRight, 
  Navigation, 
  Crosshair 
} from 'lucide-react';
import type { TripContext, Booking } from '../types';

interface TripOverviewProps {
  tripContext: TripContext | null;
  guestName: string;
  currentBooking?: Booking | null;
  onUpdateGuestName: (name: string) => void;
  onQuickAction: (action: string) => void;
  onGenerateItineraryClick: () => void;
  onOpenTransitEstimator?: () => void;
  onOpenBudget?: () => void;
  onOpenPacking?: () => void;
  userCoords?: { lat: number; lng: number } | null;
  userArea?: string;
  onEnableGps?: () => void;
}

export const TripOverview: React.FC<TripOverviewProps> = ({
  tripContext,
  guestName,
  currentBooking,
  onQuickAction,
  onGenerateItineraryClick,
  userCoords,
  userArea,
  onEnableGps,
}) => {
  const [chatPrompt, setChatPrompt] = useState<string>('');

  const hotel = tripContext?.hotel;
  const activeGuestName = guestName || currentBooking?.guestName || 'Aditya';
  const hotelName = currentBooking?.hotelName || hotel?.name || 'Taj Fort Aguada Resort & Spa';
  const hotelArea = currentBooking?.hotelLocation || hotel?.area || 'Sinquerim, Candolim';
  const bookingId = currentBooking?.id || hotel?.confirmation_code || 'GOA-TAJ-89421';
  const checkIn = currentBooking?.checkInFormatted || hotel?.check_in_formatted || 'Sep 18, 2026';
  const checkOut = currentBooking?.checkOutFormatted || hotel?.check_out_formatted || 'Sep 21, 2026';
  const roomName = currentBooking?.room?.name || hotel?.room_type || 'Deluxe Sea View Suite';

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim()) return;
    onQuickAction(chatPrompt.trim());
    setChatPrompt('');
  };

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
      marginRight: 'calc(-50vw + 50%)',
      minHeight: '62vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      overflow: 'hidden',
      marginBottom: '48px',
      color: '#FFFFFF'
    }}>
      {/* ── 1. Edge-to-Edge Full-Bleed Goa Photography ── */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url(https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2400&auto=format&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 42%',
        zIndex: 1
      }} />

      {/* ── 2. Sophisticated Navy Gradient Overlay ── */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, rgba(11, 22, 38, 0.45) 0%, rgba(11, 22, 38, 0.25) 35%, rgba(11, 22, 38, 0.85) 80%, #0B1626 100%)',
        zIndex: 2
      }} />

      {/* ── 3. Hero Content Container ── */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        padding: '96px 24px 44px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end'
      }}>
        
        {/* Subtle Upper Context Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.78rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#FED7AA',
          marginBottom: '16px'
        }}>
          <span>{hotelName.toUpperCase()} · {hotelArea.toUpperCase()}</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>|</span>
          <span>{checkIn} — {checkOut} · {roomName}</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>|</span>
          <span style={{ color: '#FDBA74' }}>BOOKING {bookingId}</span>

          {userCoords ? (
            <span style={{
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#A7F3D0',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '6px',
              padding: '2px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Crosshair size={11} /> GPS Near {userArea || 'Sinquerim'}
            </span>
          ) : (
            onEnableGps && (
              <button
                onClick={onEnableGps}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Navigation size={11} /> Enable Live GPS
              </button>
            )
          )}
        </div>

        {/* Editorial Heading Block */}
        <div style={{ maxWidth: '800px', marginBottom: '28px' }}>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#E28445',
            marginBottom: '8px'
          }}>
            Welcome, {activeGuestName}
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5.2vw, 4.2rem)',
            fontFamily: 'Playfair Display, Georgia, serif',
            fontWeight: 700,
            lineHeight: 1.08,
            color: '#FBF8F3',
            margin: '0 0 16px 0',
            letterSpacing: '-0.02em',
            textShadow: '0 4px 24px rgba(0,0,0,0.4)'
          }}>
            Your Goa stay starts here.
          </h1>

          <p style={{
            fontSize: '1.1rem',
            lineHeight: 1.6,
            color: '#E2E8F0',
            maxWidth: '620px',
            margin: '0 0 24px 0',
            fontWeight: 400
          }}>
            Your stay at <strong>{hotelName}</strong> is confirmed. Your 24/7 concierge is now curating your days, secret beaches, and sunset tables.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={onGenerateItineraryClick}
              style={{
                background: '#D05B3B',
                color: '#FFFFFF',
                border: 'none',
                padding: '13px 26px',
                borderRadius: '8px',
                fontSize: '0.94rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(208, 91, 59, 0.4)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#B94D32';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#D05B3B';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Plan my day</span>
              <ArrowRight size={15} />
            </button>

            <button
              onClick={() => onQuickAction("What can I do near my hotel?")}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '0.92rem',
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
            >
              Explore nearby
            </button>
          </div>
        </div>

        {/* ── 4. Floating Concierge Bar & 3 Quiet Suggestions ── */}
        <div style={{
          background: 'rgba(16, 28, 47, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '14px',
          padding: '14px 18px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          maxWidth: '840px',
          width: '100%'
        }}>
          <form onSubmit={handleAskSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#E28445', fontSize: '1.1rem', paddingLeft: '4px' }}>✦</span>
            
            <input
              type="text"
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              placeholder="What would you like to do in Goa today?"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#FFFFFF',
                fontSize: '0.96rem',
                fontFamily: 'inherit'
              }}
            />

            <button
              type="submit"
              style={{
                background: '#D05B3B',
                color: '#FFFFFF',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Ask</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* 3 Quiet Suggestions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginTop: '10px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.8rem',
            color: '#94A3B8',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B' }}>
              Suggestions:
            </span>

            <button
              onClick={() => onQuickAction("Where should I eat tonight?")}
              style={suggestionBtnStyle}
            >
              Dinner nearby
            </button>

            <button
              onClick={() => onQuickAction("Plan my evening.")}
              style={suggestionBtnStyle}
            >
              Plan my evening
            </button>

            <button
              onClick={() => onQuickAction("What beaches are near me for sunset?")}
              style={suggestionBtnStyle}
            >
              Best beach for sunset
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const suggestionBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#CBD5E1',
  cursor: 'pointer',
  fontSize: '0.82rem',
  fontWeight: 500,
  padding: '2px 6px',
  borderRadius: '4px',
  transition: 'color 0.15s ease'
};
