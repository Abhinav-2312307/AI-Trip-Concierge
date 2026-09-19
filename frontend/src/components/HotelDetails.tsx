import React, { useState } from 'react';
import type { HotelBooking, HotelRoom } from '../types';

interface HotelDetailsProps {
  hotel: HotelBooking;
  onBack: () => void;
  onProceedToCheckout: (bookingConfig: {
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
  }) => void;
}

export const HotelDetails: React.FC<HotelDetailsProps> = ({
  hotel,
  onBack,
  onProceedToCheckout,
}) => {
  const images = hotel.images && hotel.images.length > 0 ? hotel.images : [hotel.image_url || ''];
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const defaultRooms: HotelRoom[] = hotel.rooms && hotel.rooms.length > 0 ? hotel.rooms : [
    { id: 'room-std', name: 'Superior Room', capacity: 2, pricePerNight: hotel.startingPrice || 22000 },
    { id: 'room-dlx', name: 'Deluxe Suite with Ocean View', capacity: 3, pricePerNight: (hotel.startingPrice || 22000) * 1.35 },
    { id: 'room-villa', name: 'Luxury Villa with Private Pool', capacity: 4, pricePerNight: (hotel.startingPrice || 22000) * 2.2 }
  ];

  const [selectedRoom, setSelectedRoom] = useState<HotelRoom>(defaultRooms[0]);

  // Date calculation defaults
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fourDaysLater = new Date(tomorrow);
  fourDaysLater.setDate(fourDaysLater.getDate() + 3);

  const formatDateVal = (d: Date) => d.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState<string>(hotel.check_in || formatDateVal(tomorrow));
  const [checkOut, setCheckOut] = useState<string>(hotel.check_out || formatDateVal(fourDaysLater));
  const [guests, setGuests] = useState<number>(2);

  // Compute nights
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
  const calculatedNights = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

  const subtotal = selectedRoom.pricePerNight * calculatedNights;
  const gst = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + gst;

  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleBookNow = () => {
    onProceedToCheckout({
      hotel,
      room: selectedRoom,
      checkIn,
      checkInFormatted: formatDateDisplay(checkIn),
      checkOut,
      checkOutFormatted: formatDateDisplay(checkOut),
      nights: calculatedNights,
      guests,
      subtotal,
      gst,
      totalAmount
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px 80px' }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: '#D05B3B',
          fontWeight: 700,
          fontSize: '0.92rem',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '20px',
          padding: 0
        }}
      >
        ← Back to all Goa stays
      </button>

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{
              background: '#0B1626',
              color: '#FFFFFF',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: 700
            }}>
              {hotel.region}
            </span>
            <span style={{
              background: '#F1F5F9',
              color: '#334155',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: 600
            }}>
              {hotel.area}
            </span>
            <span style={{
              background: '#FEF3C7',
              color: '#92400E',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: 700
            }}>
              ⭐ {hotel.rating || 4.8} ({hotel.reviewCount || 2400} reviews)
            </span>
          </div>

          <h1 style={{
            fontSize: '2.4rem',
            fontFamily: 'Playfair Display, Georgia, serif',
            color: '#0B1626',
            margin: '0 0 6px'
          }}>
            {hotel.name}
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#64748B', margin: 0 }}>
            📍 {hotel.address || `${hotel.area}, ${hotel.region}, Goa`}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Starting rate</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#D05B3B' }}>
            ₹{(hotel.startingPrice || 22000).toLocaleString('en-IN')}{' '}
            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748B' }}>/ night</span>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{
          height: '440px',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }}>
          <img
            src={images[activeImageIndex] || images[0]}
            alt={hotel.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {images.length > 1 && (
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '6px' }}>
            {images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                style={{
                  width: '120px',
                  height: '80px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: activeImageIndex === idx ? '3px solid #D05B3B' : '2px solid transparent',
                  opacity: activeImageIndex === idx ? 1 : 0.7,
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
              >
                <img src={img} alt={`${hotel.name} ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '40px',
        alignItems: 'flex-start'
      }}>
        {/* Left Column: Description, Amenities, Highlights, Rooms */}
        <div>
          {/* Description */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.3rem', fontFamily: 'Playfair Display, serif', color: '#0B1626', marginBottom: '12px' }}>
              About the Stay
            </h2>
            <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.7, margin: 0 }}>
              {hotel.description}
            </p>
          </section>

          {/* Highlights */}
          {hotel.highlights && hotel.highlights.length > 0 && (
            <section style={{
              background: '#FBF8F3',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #E28445',
              marginBottom: '32px'
            }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0B1626', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✨</span> <span>Property Highlights & Concierge Perks</span>
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#334155', fontSize: '0.92rem', lineHeight: 1.5 }}>
                {hotel.highlights.map((hl, idx) => (
                  <li key={idx}><strong>{hl}</strong></li>
                ))}
              </ul>
            </section>
          )}

          {/* Amenities */}
          <section style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.3rem', fontFamily: 'Playfair Display, serif', color: '#0B1626', marginBottom: '16px' }}>
              Resort Amenities
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {(hotel.amenities || []).map((amenity, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    background: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#1E293B'
                  }}
                >
                  <span style={{ color: '#10B981', fontWeight: 800 }}>✓</span>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Room Selection */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.3rem', fontFamily: 'Playfair Display, serif', color: '#0B1626', marginBottom: '16px' }}>
              Select Room Type
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {defaultRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  style={{
                    padding: '18px 20px',
                    borderRadius: '12px',
                    border: selectedRoom.id === room.id ? '2px solid #D05B3B' : '1px solid #E2E8F0',
                    background: selectedRoom.id === room.id ? '#FFFBF8' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: selectedRoom.id === room.id ? '0 4px 12px rgba(208, 91, 59, 0.15)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0B1626', marginBottom: '4px' }}>
                      {room.name}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                      👥 Capacity: Up to {room.capacity} Guests • Free Breakfast & Wi-Fi
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#D05B3B' }}>
                      ₹{room.pricePerNight.toLocaleString('en-IN')}
                    </div>
                    <span style={{ fontSize: '0.76rem', color: '#94A3B8' }}>/ night</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Booking Card & Price Breakdown */}
        <div style={{
          position: 'sticky',
          top: '90px',
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 12px 32px rgba(11, 22, 38, 0.12)',
          border: '1px solid #E2E8F0'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'Playfair Display, serif', color: '#0B1626', margin: '0 0 18px' }}>
            Book Your Stay & AI Companion
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {/* Check-in / Check-out inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  📅 Check-in Date
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.86rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  📅 Check-out Date
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.86rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Guests selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                👥 Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests (Standard)</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4 Guests (Family / Suite)</option>
              </select>
            </div>

            {/* Selected Room Pill */}
            <div style={{
              background: '#F8FAFC',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '0.86rem'
            }}>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.74rem' }}>Selected Room:</span>
              <strong style={{ color: '#0B1626' }}>{selectedRoom.name}</strong>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div style={{
            borderTop: '1px solid #E2E8F0',
            borderBottom: '1px solid #E2E8F0',
            padding: '16px 0',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: '0.9rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
              <span>₹{selectedRoom.pricePerNight.toLocaleString('en-IN')} × {calculatedNights} night{calculatedNights > 1 ? 's' : ''}</span>
              <span style={{ fontWeight: 600, color: '#0B1626' }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
              <span>18% GST (Taxes & Tourism Cess)</span>
              <span style={{ fontWeight: 600, color: '#0B1626' }}>₹{gst.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981', fontWeight: 600, fontSize: '0.84rem' }}>
              <span>24/7 AI Concierge Companion</span>
              <span>Included FREE</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#0B1626',
              paddingTop: '10px',
              borderTop: '1px dashed #CBD5E1'
            }}>
              <span>Total Payable</span>
              <span style={{ color: '#D05B3B' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Booking CTA */}
          <button
            onClick={handleBookNow}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #D05B3B 0%, #E28445 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '16px',
              borderRadius: '10px',
              fontSize: '1.05rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(208, 91, 59, 0.35)',
              transition: 'transform 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Book This Stay →
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.76rem', color: '#94A3B8', marginTop: '12px', margin: '12px 0 0' }}>
            🔒 Instant confirmation • Unlocks post-booking AI concierge
          </p>
        </div>
      </div>
    </div>
  );
};
