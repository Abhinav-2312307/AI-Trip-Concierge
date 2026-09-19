import React, { useState, useEffect } from 'react';
import { Sunset, Waves, Sun, ArrowRight } from 'lucide-react';
import type { HotelBooking } from '../types';
import type { SupportedLanguage } from '../utils/i18n';

interface CoastalConditionsWidgetProps {
  activeHotel: HotelBooking | null;
  onAskConcierge: (prompt: string) => void;
  lang?: SupportedLanguage;
}

export const CoastalConditionsWidget: React.FC<CoastalConditionsWidgetProps> = ({
  activeHotel,
  onAskConcierge,
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; isPast: boolean }>({
    hours: 0,
    minutes: 0,
    isPast: false,
  });

  const hotelId = activeHotel?.id || 'taj-fort-aguada';

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const sunset = new Date();
      sunset.setHours(18, 35, 0, 0);

      let diff = sunset.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, isPast: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * (1000 * 60 * 60);
        const minutes = Math.floor(diff / (1000 * 60));
        setTimeLeft({ hours, minutes, isPast: false });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  const getSunsetSpot = () => {
    switch (hotelId) {
      case 'taj-fort-aguada':
        return 'Aguada Fort Cliff & Bastion';
      case 'w-goa':
        return 'Rockpool Chapora Cliffside';
      case 'alila-diwa':
        return 'Gonsua Beachfront Lounge';
      default:
        return 'Sinquerim Beach Headland';
    }
  };

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '14px',
      border: '1px solid rgba(11, 22, 38, 0.08)',
      boxShadow: '0 2px 12px rgba(11, 22, 38, 0.03)',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '20px'
    }}>
      
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
        <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D05B3B' }}>
          Coastal Conditions
        </span>
      </div>

      {/* Metric 1: Temp & Sky */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sun size={16} color="#F59E0B" />
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0B1626' }}>29°C · Clear Sky</div>
          <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Gentle coastal breeze</div>
        </div>
      </div>

      <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} className="condition-divider" />

      {/* Metric 2: Sea Swimming */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Waves size={16} color="#0284C7" />
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0B1626' }}>Calm · Green Flag</div>
          <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Safe for ocean swimming</div>
        </div>
      </div>

      <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} className="condition-divider" />

      {/* Metric 3: Tide */}
      <div>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0B1626' }}>Low Tide (0.4m)</div>
        <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Next high tide at 19:10</div>
      </div>

      <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} className="condition-divider" />

      {/* Metric 4: Sunset */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sunset size={16} color="#D05B3B" />
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0B1626' }}>
            {timeLeft.isPast ? 'Sunset 18:35' : `Sunset in ${timeLeft.hours > 0 ? `${timeLeft.hours}h ` : ''}${timeLeft.minutes}m`}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{getSunsetSpot()}</div>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={() => onAskConcierge("Tell me about today's coastal conditions and best sunset spots.")}
        style={{
          background: 'none',
          border: 'none',
          color: '#D05B3B',
          fontSize: '0.84rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px'
        }}
      >
        <span>View details</span>
        <ArrowRight size={14} />
      </button>

      {/* Embedded CSS */}
      <style>{`
        @media (max-width: 900px) {
          .condition-divider {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
