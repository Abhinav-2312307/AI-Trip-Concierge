import React, { useState } from 'react';
import { X, Wallet } from 'lucide-react';
import type { ItineraryResponse, HotelBooking } from '../types';

interface TripBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  itineraryData: ItineraryResponse | null;
  activeHotel: HotelBooking | null;
}

type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'AED';

const CURRENCY_RATES: Record<CurrencyCode, { symbol: string; rateFromINR: number; label: string }> = {
  INR: { symbol: '₹', rateFromINR: 1, label: 'Indian Rupee (INR)' },
  USD: { symbol: '$', rateFromINR: 0.012, label: 'US Dollar (USD)' },
  EUR: { symbol: '€', rateFromINR: 0.011, label: 'Euro (EUR)' },
  GBP: { symbol: '£', rateFromINR: 0.0094, label: 'British Pound (GBP)' },
  AUD: { symbol: 'A$', rateFromINR: 0.018, label: 'Australian Dollar (AUD)' },
  AED: { symbol: 'AED ', rateFromINR: 0.044, label: 'UAE Dirham (AED)' },
};

export const TripBudgetModal: React.FC<TripBudgetModalProps> = ({
  isOpen,
  onClose,
  itineraryData,
  activeHotel,
}) => {
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [guestsCount, setGuestsCount] = useState<number>(2);

  if (!isOpen) return null;

  const hotelName = activeHotel?.name || 'Taj Fort Aguada Resort & Spa';
  const days = itineraryData?.itinerary || [];

  // Parse numerical estimate from budget strings like "₹1,800 for two", "₹400 per person"
  let diningINR = 0;
  let activityINR = 0;
  let transportINR = 0;

  days.forEach((d) => {
    [d.morning, d.afternoon, d.evening].forEach((slot) => {
      if (!slot) return;
      const numMatch = slot.budget?.match(/[\d,]+/);
      const parsedVal = numMatch ? parseInt(numMatch[0].replace(/,/g, ''), 10) : 600;

      if (slot.place?.category === 'restaurant' || slot.food_tip) {
        diningINR += parsedVal;
      } else {
        activityINR += parsedVal;
      }
      transportINR += 450; // Average local cab / fuel per slot
    });
  });

  // Fallbacks if itinerary is empty
  if (diningINR === 0) diningINR = 6400;
  if (activityINR === 0) activityINR = 2800;
  if (transportINR === 0) transportINR = 3200;

  const totalTripINR = diningINR + activityINR + transportINR;
  const currentRate = CURRENCY_RATES[currency];

  const formatAmount = (valINR: number) => {
    const converted = Math.round(valINR * currentRate.rateFromINR);
    return `${currentRate.symbol}${converted.toLocaleString()}`;
  };

  const perPersonINR = Math.round(totalTripINR / guestsCount);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(11, 22, 38, 0.78)',
      backdropFilter: 'blur(6px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }} className="animate-fade-in" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'var(--bg-card)',
          padding: '28px',
          borderRadius: 'var(--radius-md)',
          position: 'relative',
          border: '1px solid var(--border-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'var(--bg-tertiary)',
            border: 'none',
            borderRadius: 'var(--radius-xs)',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}
        >
          <X size={16} />
        </button>

        {/* Modal Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-xs)',
            background: 'var(--accent-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
          }}>
            <Wallet size={20} />
          </div>
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Trip Budget & Expense Estimator
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Computed from {days.length > 0 ? `${days.length}-day curated itinerary` : '3-day trip'} • {hotelName}
            </span>
          </div>
        </div>

        {/* Currency & Split Controls */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px',
          margin: '18px 0',
          background: 'var(--bg-tertiary)',
          padding: '14px 18px',
          borderRadius: 'var(--radius-xs)',
          border: '1px solid var(--border-primary)',
        }}>
          {/* Currency Switcher */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Display Currency:
            </label>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid',
                    borderColor: currency === c ? 'var(--accent-secondary)' : 'var(--border-primary)',
                    background: currency === c ? 'var(--accent-secondary)' : 'var(--bg-card)',
                    color: currency === c ? '#FFFFFF' : 'var(--text-primary)',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Group Size / Guests */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Split Among Guests:
              </span>
              <strong style={{ fontSize: '0.82rem', color: 'var(--accent-primary)' }}>
                {guestsCount} {guestsCount === 1 ? 'Traveler' : 'Travelers'}
              </strong>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              value={guestsCount}
              onChange={(e) => setGuestsCount(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Big Total Card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginBottom: '20px',
        }}>
          <div className="glass-card" style={{
            padding: '16px 20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Total Trip Estimated Cost
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {formatAmount(totalTripINR)}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              All dining, entry tickets & transit
            </div>
          </div>

          <div className="glass-card" style={{
            padding: '16px 20px',
            background: 'rgba(208, 91, 59, 0.08)',
            border: '1px solid var(--accent-primary)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Cost Per Person ({guestsCount} Guests)
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '2px' }}>
              {formatAmount(perPersonINR)}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              {currentRate.label}
            </div>
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '22px' }}>
          <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Category Cost Allocation:
          </h4>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 14px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-xs)',
          }}>
            <div>
              <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>🍽️ Dining & Beach Shacks</strong>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Breakfast, seafood lunches, signature dinners</div>
            </div>
            <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{formatAmount(diningINR)}</strong>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 14px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-xs)',
          }}>
            <div>
              <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>🏛️ Heritage & Activities</strong>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Fort entries, water sports, church donations</div>
            </div>
            <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{formatAmount(activityINR)}</strong>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 14px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-xs)',
          }}>
            <div>
              <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>🚕 Local Cabs & Scooter Fuel</strong>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Daily transfers from hotel origin</div>
            </div>
            <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{formatAmount(transportINR)}</strong>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button onClick={onClose} className="btn-primary" style={{ padding: '8px 20px', borderRadius: 'var(--radius-xs)' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
