import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { Booking } from '../types';

interface BookingConfirmationProps {
  booking: Booking;
  onStartJourney: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  booking,
  onStartJourney,
}) => {
  useEffect(() => {
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D05B3B', '#E28445', '#10B981', '#101F35']
    });
  }, []);

  return (
    <div style={{
      maxWidth: '680px',
      margin: '40px auto 80px',
      padding: '0 20px',
      textAlign: 'center'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '48px 36px',
        boxShadow: '0 20px 50px rgba(11, 22, 38, 0.1)',
        border: '1px solid #E2E8F0',
        position: 'relative'
      }}>
        {/* Success Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.2rem',
          color: '#FFFFFF',
          margin: '0 auto 20px',
          boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)'
        }}>
          ✓
        </div>

        <span style={{
          display: 'inline-block',
          background: '#ECFDF5',
          color: '#065F46',
          border: '1px solid #A7F3D0',
          borderRadius: '999px',
          padding: '4px 16px',
          fontSize: '0.84rem',
          fontWeight: 700,
          marginBottom: '12px'
        }}>
          Booking Reference: {booking.id}
        </span>

        <h1 style={{
          fontSize: '2.2rem',
          fontFamily: 'Playfair Display, Georgia, serif',
          color: '#0B1626',
          margin: '0 0 10px'
        }}>
          Booking Confirmed!
        </h1>

        <p style={{
          fontSize: '1.05rem',
          color: '#64748B',
          maxWidth: '480px',
          margin: '0 auto 28px',
          lineHeight: 1.5
        }}>
          Your stay is booked. Now let's plan your Goa experience with your personal AI concierge.
        </p>

        {/* Details Card */}
        <div style={{
          background: '#F8FAFC',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          textAlign: 'left',
          marginBottom: '32px'
        }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0B1626', marginBottom: '4px' }}>
            {booking.hotelName}
          </div>
          <div style={{ fontSize: '0.86rem', color: '#64748B', marginBottom: '16px' }}>
            📍 {booking.hotelLocation} • {booking.room.name}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            borderTop: '1px solid #E2E8F0',
            paddingTop: '16px',
            fontSize: '0.86rem'
          }}>
            <div>
              <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.74rem' }}>Check-in</span>
              <strong style={{ color: '#0B1626' }}>{booking.checkInFormatted}</strong>
            </div>
            <div>
              <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.74rem' }}>Check-out</span>
              <strong style={{ color: '#0B1626' }}>{booking.checkOutFormatted}</strong>
            </div>
            <div>
              <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.74rem' }}>Guests</span>
              <strong style={{ color: '#0B1626' }}>{booking.guests} Guests</strong>
            </div>
            <div>
              <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.74rem' }}>Total Paid</span>
              <strong style={{ color: '#D05B3B' }}>₹{booking.totalAmount.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        {/* Transition CTA */}
        <button
          onClick={onStartJourney}
          style={{
            background: 'linear-gradient(135deg, #D05B3B 0%, #E28445 100%)',
            color: '#FFFFFF',
            border: 'none',
            padding: '16px 36px',
            borderRadius: '10px',
            fontSize: '1.1rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(208, 91, 59, 0.4)',
            letterSpacing: '0.04em',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          START MY GOA JOURNEY →
        </button>
      </div>
    </div>
  );
};
