import React, { useState } from 'react';
import { Calendar, MapPin, Users, Check, Sparkles, MessageSquareText, ShieldCheck, Compass, Eye } from 'lucide-react';
import type { HotelBooking } from '../types';

interface BookingsViewProps {
  bookings: HotelBooking[];
  activeHotelId: string;
  guestName: string;
  onSelectBooking: (hotelId: string) => void;
  onOpenConcierge: (hotelId: string) => void;
  onPlanTrip: (hotelId: string) => void;
  onViewDetails: (hotel: HotelBooking) => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  activeHotelId,
  guestName,
  onSelectBooking,
  onOpenConcierge,
  onPlanTrip,
  onViewDetails,
}) => {
  const [regionFilter, setRegionFilter] = useState<string>('all');

  const filteredBookings = bookings.filter((b) => {
    if (regionFilter === 'all') return true;
    return b.region.toLowerCase().includes(regionFilter.toLowerCase());
  });

  const activeHotel = bookings.find((b) => b.id === activeHotelId) || bookings[0];

  return (
    <div className="animate-fade-in" style={{ marginTop: '12px' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        marginBottom: '22px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Compass size={12} color="var(--accent-primary)" /> Post-Booking Travel Hub
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              • {bookings.length} Verified Goa Reservations
            </span>
          </div>
          <h2 className="font-serif" style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            My Hotel Bookings & Travel History
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px', marginBottom: 0 }}>
            Select any hotel reservation below to activate its personalized AI Trip Concierge, itinerary, and coastal alerts.
          </p>
        </div>

        {/* Region Filter Buttons */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-tertiary)',
          padding: '3px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-primary)',
        }}>
          {['all', 'North Goa', 'South Goa'].map((reg) => (
            <button
              key={reg}
              onClick={() => setRegionFilter(reg)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: regionFilter === reg ? 'var(--accent-secondary)' : 'transparent',
                color: regionFilter === reg ? '#FFFFFF' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              {reg === 'all' ? 'All Bookings' : reg}
            </button>
          ))}
        </div>
      </div>

      {/* Active Trip Banner Indicator */}
      {activeHotel && (
        <div className="glass-card" style={{
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px 22px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          border: '1px solid var(--accent-primary)',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
            }}>
              🏨
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--accent-primary)', fontWeight: 700 }}>
                Active Trip Selected
              </div>
              <h3 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 700, margin: '2px 0 0', color: 'var(--text-primary)' }}>
                {activeHotel.name} • {activeHotel.area}
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                <span>📅 {activeHotel.check_in_formatted} – {activeHotel.check_out_formatted}</span>
                <span>•</span>
                <span>Ref: <code style={{ color: 'var(--accent-primary)' }}>{activeHotel.confirmation_code}</code></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onPlanTrip(activeHotel.id)}
              className="btn-secondary"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                padding: '7px 14px'
              }}
            >
              <Sparkles size={13} color="var(--accent-primary)" /> View Itinerary
            </button>

            <button
              onClick={() => onOpenConcierge(activeHotel.id)}
              className="btn-terracotta"
              style={{
                fontSize: '0.82rem',
                padding: '7px 16px'
              }}
            >
              <MessageSquareText size={14} /> Open Concierge
            </button>
          </div>
        </div>
      )}

      {/* Bookings Card Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        {filteredBookings.map((hotel) => {
          const isActive = hotel.id === activeHotelId;

          return (
            <div
              key={hotel.id}
              className="glass-card"
              style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isActive ? '2px solid var(--accent-primary)' : '1px solid var(--border-primary)',
                boxShadow: isActive ? '0 8px 24px rgba(208, 91, 59, 0.15)' : 'var(--shadow-card)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div>
                {/* Photo with Overlay Badges */}
                <div style={{ position: 'relative', height: '190px' }}>
                  <img
                    src={hotel.image_url}
                    alt={hotel.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)'
                  }} />

                  {/* Top Status & Region Badges */}
                  <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                    <span style={{
                      background: 'rgba(16, 185, 129, 0.95)',
                      color: '#FFFFFF',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-xs)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      <Check size={11} /> {hotel.status || 'Confirmed Sample Reservation'}
                    </span>

                    <span style={{
                      background: 'rgba(23, 45, 77, 0.9)',
                      color: '#FFFFFF',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-xs)'
                    }}>
                      {hotel.region}
                    </span>
                  </div>

                  {/* Active Indicator Badge */}
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'var(--accent-primary)',
                      color: '#FFFFFF',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-xs)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}>
                      ⭐ Active Trip
                    </div>
                  )}

                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '12px',
                    right: '12px',
                    color: '#FFFFFF'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                      <MapPin size={11} /> {hotel.area}
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '2px 0 0', lineHeight: 1.3, color: '#FFFFFF' }}>
                      {hotel.name}
                    </h3>
                  </div>
                </div>

                {/* Details Section */}
                <div style={{ padding: '16px 20px' }}>
                  {/* Reservation Meta Box */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    background: 'var(--bg-tertiary)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-primary)',
                    fontSize: '0.82rem',
                    marginBottom: '14px'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                        Trip Dates
                      </span>
                      <strong style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Calendar size={13} color="var(--accent-primary)" /> {hotel.check_in_formatted} – {hotel.check_out_formatted}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                        Guests & Duration
                      </span>
                      <strong style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Users size={13} color="var(--accent-secondary)" /> {guestName ? `${guestName} (2 Guests)` : '2 Guests'} • 3 Nights
                      </strong>
                    </div>
                  </div>

                  {/* Suite Type & Ref */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={13} color="var(--accent-success)" />
                      <span>{hotel.room_type}</span>
                    </span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      Ref: <code style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{hotel.confirmation_code}</code>
                    </span>
                  </div>

                  {/* Highlights Bullet List */}
                  {hotel.highlights && hotel.highlights.length > 0 && (
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                      marginBottom: '14px',
                      background: 'var(--bg-tertiary)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-xs)',
                      borderLeft: '3px solid var(--accent-secondary)'
                    }}>
                      {hotel.highlights[0]}
                    </div>
                  )}

                  {/* Amenities Preview */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                    {hotel.amenities.slice(0, 3).map((amenity, i) => (
                      <span key={i} className="badge-pill badge-ocean" style={{ fontSize: '0.72rem' }}>
                        {amenity}
                      </span>
                    ))}
                    {hotel.amenities.length > 3 && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center', paddingLeft: '4px' }}>
                        +{hotel.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div style={{
                padding: '14px 20px',
                background: 'var(--bg-tertiary)',
                borderTop: '1px solid var(--border-primary)',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => onViewDetails(hotel)}
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    fontSize: '0.8rem',
                    padding: '7px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Eye size={13} /> Details
                </button>

                <button
                  onClick={() => onPlanTrip(hotel.id)}
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    fontSize: '0.8rem',
                    padding: '7px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={13} color="var(--accent-primary)" /> Itinerary
                </button>

                <button
                  onClick={() => {
                    onSelectBooking(hotel.id);
                    onOpenConcierge(hotel.id);
                  }}
                  className={isActive ? "btn-terracotta" : "btn-primary"}
                  style={{
                    flex: 1.2,
                    fontSize: '0.8rem',
                    padding: '7px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <MessageSquareText size={13} /> {isActive ? 'Open Concierge' : 'Select Trip'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
