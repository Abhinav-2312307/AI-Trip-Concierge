import React, { useState, useEffect } from 'react';
import { Sunset, Waves, Sparkles, AlertCircle } from 'lucide-react';
import type { HotelBooking } from '../types';
import type { SupportedLanguage } from '../utils/i18n';
import { t } from '../utils/i18n';

interface CoastalConditionsWidgetProps {
  activeHotel: HotelBooking | null;
  onAskConcierge: (prompt: string) => void;
  lang?: SupportedLanguage;
}

export const CoastalConditionsWidget: React.FC<CoastalConditionsWidgetProps> = ({
  activeHotel,
  onAskConcierge,
  lang = 'en',
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isPast: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  const hotelName = activeHotel?.name || 'Taj Fort Aguada Resort & Spa';
  const hotelId = activeHotel?.id || 'taj-fort-aguada';

  // Goa average sunset is ~18:35 IST
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const sunset = new Date();
      sunset.setHours(18, 35, 0, 0);

      let diff = sunset.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isPast: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * (1000 * 60 * 60);
        const minutes = Math.floor(diff / (1000 * 60));
        diff -= minutes * (1000 * 60);
        const seconds = Math.floor(diff / 1000);
        setTimeLeft({ hours, minutes, seconds, isPast: false });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const getBestSunsetVantage = () => {
    switch (hotelId) {
      case 'taj-fort-aguada':
        return {
          spot: 'Aguada Fort Cliff & SFX Deck',
          distance: 'Adjoining Resort',
          vibe: 'Historic Portuguese battlements overlooking the vast Arabian Sea horizon.',
        };
      case 'w-goa':
        return {
          spot: 'Rockpool Sunset Deck at Chapora',
          distance: 'Inside Resort (Vagator)',
          vibe: 'High-energy DJ lounge carved into the red laterite cliffside.',
        };
      case 'the-leela-goa':
        return {
          spot: 'Mobor Beach & River Sal Confluence',
          distance: 'Private Hotel Beachfront',
          vibe: 'Serene, unhurried sunset reflections where the river meets the sea.',
        };
      case 'alila-diwa':
        return {
          spot: 'Courtyard Infinity Pool & Gonsua Beach',
          distance: '5 mins shuttle / pool deck',
          vibe: 'Lush coconut groves silhouetted against pastel evening skies.',
        };
      default:
        return {
          spot: 'Sinquerim Beach Headland',
          distance: 'Near Hotel',
          vibe: 'Spectacular sunset vantage point with ocean breeze.',
        };
    }
  };

  const vantage = getBestSunsetVantage();

  return (
    <div className="glass-card card-interactive" style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-md)',
      padding: '20px 24px',
      marginBottom: '24px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      alignItems: 'center',
    }}>
      {/* Sunset Countdown Column */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: 'var(--radius-sm)',
          background: 'linear-gradient(135deg, #E28445 0%, #D05B3B 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          flexShrink: 0,
          boxShadow: '0 4px 14px rgba(208, 91, 59, 0.35)',
        }}>
          <Sunset size={24} />
        </div>

        <div>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--accent-primary)', fontWeight: 700 }}>
            {timeLeft.isPast ? 'Goa Sunset Concluded' : `${t('sunsetCountdown', lang)} (18:35 IST)`}
          </div>

          {!timeLeft.isPast ? (
            <div style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              fontFamily: 'monospace',
              letterSpacing: '0.02em',
              marginTop: '2px',
            }}>
              {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
            </div>
          ) : (
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              Dusk in Goa • Evening dining & shacks are lively!
            </div>
          )}

          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            <span>🌅 <strong>Vantage Point:</strong> {vantage.spot} ({vantage.distance})</span>
          </div>
        </div>
      </div>

      {/* Coastal Swimming & Tide Conditions */}
      <div style={{
        background: 'var(--bg-tertiary)',
        padding: '14px 16px',
        borderRadius: 'var(--radius-xs)',
        border: '1px solid var(--border-primary)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            <Waves size={14} color="var(--accent-secondary)" />
            <span>{t('seaSwimStatus', lang)}</span>
          </div>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#065F46',
            background: '#D1FAE5',
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
            {t('safeToSwim', lang)}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
          <div>
            <span>🌡️ Water Temp: <strong style={{ color: 'var(--text-primary)' }}>28°C (82°F)</strong></span>
          </div>
          <div>
            <span>🌊 Tide: <strong style={{ color: 'var(--text-primary)' }}>Low (0.8m)</strong></span>
          </div>
          <div>
            <span>💨 Sea Breeze: <strong style={{ color: 'var(--text-primary)' }}>14 km/h WSW</strong></span>
          </div>
          <div>
            <span>☀️ UV Index: <strong style={{ color: 'var(--accent-primary)' }}>Moderate (5.2)</strong></span>
          </div>
        </div>
      </div>

      {/* Action / Ask Concierge Shortcut */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => onAskConcierge(`What are the top 3 spots to watch today's sunset near ${hotelName}, and can you recommend cocktails and seating tips?`)}
          className="btn-terracotta"
          style={{
            fontSize: '0.82rem',
            padding: '10px 14px',
            borderRadius: 'var(--radius-xs)',
            gap: '6px',
            width: '100%',
          }}
        >
          <Sparkles size={14} /> Sunset Spots Near Hotel
        </button>

        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={12} color="var(--accent-primary)" />
          <span>Lifeguards active 07:30 AM to 18:45 PM on all hotel beaches.</span>
        </div>
      </div>
    </div>
  );
};
