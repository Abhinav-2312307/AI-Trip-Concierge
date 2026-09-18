import React from 'react';
import { X, Calendar, MapPin, Users, ShieldCheck, Check, Sparkles, MessageSquareText } from 'lucide-react';
import type { HotelBooking } from '../types';

interface BookingDetailModalProps {
  hotel: HotelBooking | null;
  isOpen: boolean;
  onClose: () => void;
  isActive: boolean;
  guestName?: string;
  onSelectAndOpenConcierge: (hotelId: string) => void;
  onSelectAndPlanItinerary: (hotelId: string) => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  hotel,
  isOpen,
  onClose,
  isActive,
  guestName,
  onSelectAndOpenConcierge,
  onSelectAndPlanItinerary,
}) => {
  if (!isOpen || !hotel) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(11, 22, 38, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-elevated)',
          position: 'relative',
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero Image */}
        <div style={{ position: 'relative', height: '240px', background: '#0B1626' }}>
          <img
            src={hotel.image_url}
            alt={hotel.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(11,22,38,0.4) 0%, rgba(11,22,38,0.85) 100%)'
          }} />

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={18} />
          </button>

          {/* Top Badges */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '20px',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <span style={{
              background: 'rgba(16, 185, 129, 0.9)',
              color: '#FFFFFF',
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Check size={12} /> {hotel.status || 'Confirmed Demo Booking'}
            </span>

            <span style={{
              background: 'rgba(208, 91, 59, 0.9)',
              color: '#FFFFFF',
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 'var(--radius-xs)',
            }}>
              {hotel.region}
            </span>

            {isActive && (
              <span style={{
                background: 'var(--accent-primary)',
                color: '#FFFFFF',
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ⭐ Currently Active Trip
              </span>
            )}
          </div>

          {/* Bottom Title on Banner */}
          <div style={{
            position: 'absolute',
            bottom: '18px',
            left: '24px',
            right: '24px',
            color: '#FFFFFF'
          }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <MapPin size={13} /> {hotel.area}
            </div>
            <h2 className="font-serif" style={{ fontSize: '1.65rem', fontWeight: 700, lineHeight: 1.25, margin: 0 }}>
              {hotel.name}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px' }}>
          {/* Key Reservation Highlights Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            marginBottom: '22px'
          }}>
            <div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                Check-in & Check-out
              </span>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color="var(--accent-primary)" />
                <span>{hotel.check_in_formatted} – {hotel.check_out_formatted}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                Check-in: {hotel.check_in_time} • Check-out: {hotel.check_out_time}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                Suite & Confirmation
              </span>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="var(--accent-success)" />
                <span>{hotel.room_type}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '2px', display: 'block' }}>
                Ref: <code>{hotel.confirmation_code}</code>
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                Guest Party
              </span>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={14} color="var(--accent-secondary)" />
                <span>{guestName ? `${guestName} (${hotel.guests_count} Guests)` : `${hotel.guests_count} Guests`}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                {hotel.duration || '3 Nights / 4 Days'}
              </span>
            </div>
          </div>

          {/* Address */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Property Address
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              {hotel.address}
            </p>
          </div>

          {/* Hotel Highlights */}
          {hotel.highlights && hotel.highlights.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Resort Highlights & Experiences
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {hotel.highlights.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Amenities Badges */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div style={{ marginBottom: '26px' }}>
              <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Included Amenities
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {hotel.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-primary)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-xs)'
                    }}
                  >
                    ✨ {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '10px',
            borderTop: '1px solid var(--card-border)',
            paddingTop: '18px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '9px 18px', fontSize: '0.86rem' }}
            >
              Close
            </button>

            <button
              onClick={() => {
                onSelectAndPlanItinerary(hotel.id);
                onClose();
              }}
              className="btn-secondary"
              style={{
                padding: '9px 18px',
                fontSize: '0.86rem',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={14} color="var(--accent-primary)" /> Plan My Trip
            </button>

            <button
              onClick={() => {
                onSelectAndOpenConcierge(hotel.id);
                onClose();
              }}
              className="btn-terracotta"
              style={{
                padding: '9px 20px',
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MessageSquareText size={15} /> Open AI Concierge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
