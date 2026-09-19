import React, { useState } from 'react';
import type { HotelBooking, HotelRoom, Booking, User } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingConfig: {
    hotel: HotelBooking;
    room: HotelRoom;
    checkIn: string;
    checkInFormatted: string;
    checkOut: string;
    checkOutFormatted: string;
    nights: number;
    guests: number;
    subtotal: number;
    gst: number;
    totalAmount: number;
  };
  currentUser: User | null;
  onConfirmBooking: (booking: Booking) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  bookingConfig,
  currentUser,
  onConfirmBooking,
}) => {
  const [name, setName] = useState<string>(currentUser?.name || 'Aditya Sharma');
  const [email, setEmail] = useState<string>(currentUser?.email || 'aditya.sharma@example.com');
  const [phone, setPhone] = useState<string>(currentUser?.phone || '+91 98765 43210');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'instant'>('instant');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const { hotel, room, checkIn, checkInFormatted, checkOut, checkOutFormatted, nights, guests, subtotal, gst, totalAmount } = bookingConfig;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const hotelPrefix = hotel.id.split('-')[0]?.toUpperCase() || 'GOA';
      const randomCode = Math.floor(10000 + Math.random() * 90000);
      const bookingId = `GOA-${hotelPrefix}-${randomCode}`;

      const bookingObj: Booking = {
        id: bookingId,
        userId: currentUser?.id || `user-${Date.now()}`,
        hotelId: hotel.id,
        hotelName: hotel.name,
        hotelLocation: `${hotel.area}, ${hotel.region}`,
        hotelImage: hotel.images?.[0] || hotel.image_url,
        checkIn,
        checkInFormatted,
        checkOut,
        checkOutFormatted,
        nights,
        guests,
        room,
        subtotal,
        gst,
        totalAmount,
        status: 'CONFIRMED',
        guestName: name.trim() || 'Aditya Sharma',
        guestEmail: email.trim() || 'aditya.sharma@example.com',
        guestPhone: phone.trim() || '+91 98765 43210',
        createdAt: new Date().toISOString()
      };

      setIsProcessing(false);
      onConfirmBooking(bookingObj);
    }, 600);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(11, 22, 38, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(6px)',
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '1.4rem',
            color: '#94A3B8',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          ✕
        </button>

        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#D05B3B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Final Step
          </span>
          <h2 style={{ fontSize: '1.6rem', fontFamily: 'Playfair Display, serif', color: '#0B1626', margin: '4px 0 0' }}>
            Confirm Stay & Activate AI
          </h2>
        </div>

        {/* Stay Summary Card */}
        <div style={{
          background: '#F8FAFC',
          borderRadius: '12px',
          padding: '18px',
          border: '1px solid #E2E8F0',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0B1626', marginBottom: '4px' }}>
            {hotel.name}
          </div>
          <div style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '12px' }}>
            📍 {hotel.area}, {hotel.region} • {room.name}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            fontSize: '0.84rem',
            background: '#FFFFFF',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0'
          }}>
            <div>
              <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.74rem' }}>Check-in:</span>
              <strong style={{ color: '#0B1626' }}>{checkInFormatted}</strong>
            </div>
            <div>
              <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.74rem' }}>Check-out:</span>
              <strong style={{ color: '#0B1626' }}>{checkOutFormatted}</strong>
            </div>
            <div>
              <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.74rem' }}>Duration:</span>
              <strong style={{ color: '#0B1626' }}>{nights} Night{nights > 1 ? 's' : ''}</strong>
            </div>
            <div>
              <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.74rem' }}>Guests:</span>
              <strong style={{ color: '#0B1626' }}>{guests} Guests</strong>
            </div>
          </div>
        </div>

        <form onSubmit={handleConfirm}>
          {/* Guest Information */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0B1626', marginBottom: '10px' }}>
              Guest Contact Details
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Primary Guest Full Name"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Demo Payment Methods */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0B1626', marginBottom: '10px' }}>
              Payment Method (Hackathon Demo Sandbox)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'instant', icon: '⚡', label: 'Instant Demo Pay (1-Click Instant Confirmation)' },
                { id: 'upi', icon: '📱', label: 'Demo UPI (Google Pay / PhonePe / Paytm)' },
                { id: 'card', icon: '💳', label: 'Demo Credit / Debit Card (Visa / Mastercard / Amex)' }
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: paymentMethod === m.id ? '2px solid #D05B3B' : '1px solid #E2E8F0',
                    background: paymentMethod === m.id ? '#FFFBF8' : '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '0.86rem',
                    fontWeight: paymentMethod === m.id ? 700 : 500,
                    color: '#0B1626'
                  }}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Total */}
          <div style={{
            background: '#F1F5F9',
            padding: '14px 18px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block' }}>Total Amount (incl. 18% GST)</span>
              <strong style={{ fontSize: '1.25rem', color: '#D05B3B' }}>₹{totalAmount.toLocaleString('en-IN')}</strong>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700 }}>
              ✓ Concierge Included
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #D05B3B 0%, #E28445 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              opacity: isProcessing ? 0.7 : 1,
              boxShadow: '0 4px 16px rgba(208, 91, 59, 0.35)'
            }}
          >
            {isProcessing ? 'Confirming Reservation...' : `Confirm & Pay ₹${totalAmount.toLocaleString('en-IN')}`}
          </button>
        </form>
      </div>
    </div>
  );
};
