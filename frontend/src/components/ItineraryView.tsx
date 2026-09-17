import React, { useState } from 'react';
import { Clock, MapPin, Sparkles, Utensils, Sun, Moon, Sunrise, Navigation, MessageSquare } from 'lucide-react';
import type { ItineraryResponse, ItinerarySlot, HotelBooking } from '../types';

interface ItineraryViewProps {
  itineraryData: ItineraryResponse | null;
  loading: boolean;
  activeHotel: HotelBooking | null;
  onGenerate: (days: number) => void;
  onAskConciergeAboutPlace: (placeName: string) => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  itineraryData,
  loading,
  activeHotel,
  onGenerate,
  onAskConciergeAboutPlace,
}) => {
  const [selectedDays, setSelectedDays] = useState<number>(3);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);

  const days = itineraryData?.itinerary || [];
  const currentDay = days[activeDayIndex] || days[0];

  const hotelName = activeHotel?.name || itineraryData?.hotel || 'Taj Fort Aguada Resort & Spa, Goa';
  const hotelArea = activeHotel?.area || 'Candolim, Goa';

  return (
    <div style={{ marginTop: '12px' }} className="animate-fade-in">
      {/* Planner Header & Duration Control */}
      <div className="glass-card" style={{
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        background: '#FFFFFF',
      }}>
        <div>
          <h2 className="font-serif" style={{ fontSize: '1.45rem', fontWeight: 700, color: '#101F35' }}>
            Curated Day-by-Day Itinerary
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '2px' }}>
            Personalized route sequenced realistically from <strong>{hotelName}</strong> ({hotelArea}).
          </p>
        </div>

        {/* Days Selector & Generate Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--color-sand-100)',
            padding: '3px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--card-border)',
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', padding: '0 8px' }}>
              Duration:
            </span>
            {[1, 2, 3, 4, 5].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDays(d)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: selectedDays === d ? 'var(--color-ocean-900)' : 'transparent',
                  color: selectedDays === d ? '#FFFFFF' : '#475569',
                  transition: 'all 0.15s ease',
                }}
              >
                {d} {d === 1 ? 'Day' : 'Days'}
              </button>
            ))}
          </div>

          <button
            onClick={() => onGenerate(selectedDays)}
            disabled={loading}
            className="btn-terracotta"
            style={{
              padding: '8px 18px',
              fontSize: '0.86rem',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <>
                <Sparkles size={14} className="animate-spin" /> Planning...
              </>
            ) : (
              <>
                <Sparkles size={14} /> Update to {selectedDays} Days
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', background: '#FFFFFF' }}>
          <Sparkles size={24} color="#D05B3B" style={{ display: 'inline-block', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#101F35', marginBottom: '4px' }}>
            Organizing Your Goa Schedule for {hotelName}...
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.86rem' }}>
            Calculating travel times, beach hours, and verified dining spots from {hotelArea}.
          </p>
        </div>
      )}

      {/* Main Itinerary Content */}
      {!loading && days.length > 0 && currentDay && (
        <div>
          {/* Day Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '8px',
            marginBottom: '16px',
          }}>
            {days.map((day, idx) => (
              <button
                key={day.day_number}
                onClick={() => setActiveDayIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: activeDayIndex === idx ? 'var(--color-ocean-900)' : 'var(--card-border)',
                  background: activeDayIndex === idx ? '#FFFFFF' : 'var(--color-sand-50)',
                  color: activeDayIndex === idx ? 'var(--color-ocean-900)' : '#64748B',
                  fontWeight: activeDayIndex === idx ? 700 : 500,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  boxShadow: activeDayIndex === idx ? 'var(--shadow-subtle)' : 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: 'var(--radius-xs)',
                  background: activeDayIndex === idx ? 'var(--color-ocean-900)' : 'var(--color-sand-200)',
                  color: activeDayIndex === idx ? '#FFFFFF' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {day.day_number}
                </span>
                <span>Day {day.day_number} {day.date_formatted ? `(${day.date_formatted})` : ''}: {day.theme}</span>
              </button>
            ))}
          </div>

          {/* Current Day Header Card */}
          <div style={{
            background: 'var(--color-ocean-900)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-sm)',
            padding: '16px 22px',
            marginBottom: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Day {currentDay.day_number} Overview</span>
                {currentDay.full_date_formatted && (
                  <span style={{ color: '#FDBA74', background: 'rgba(255,255,255,0.1)', padding: '1px 7px', borderRadius: '3px', textTransform: 'none' }}>
                    📅 {currentDay.full_date_formatted}
                  </span>
                )}
              </div>
              <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2px' }}>
                {currentDay.title}
              </h3>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Navigation size={13} color="#E28445" /> Depart from {hotelName}
            </div>
          </div>

          {/* Timeline Cards: Morning, Afternoon, Evening */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Morning Slot */}
            <TimelineCard
              period="Morning"
              icon={<Sunrise size={17} color="#D05B3B" />}
              slot={currentDay.morning}
              colorBorder="#D05B3B"
              onAskConcierge={onAskConciergeAboutPlace}
            />

            {/* Afternoon Slot */}
            <TimelineCard
              period="Afternoon"
              icon={<Sun size={17} color="#E28445" />}
              slot={currentDay.afternoon}
              colorBorder="#E28445"
              onAskConcierge={onAskConciergeAboutPlace}
            />

            {/* Evening Slot */}
            <TimelineCard
              period="Evening & Dinner"
              icon={<Moon size={17} color="#2C5282" />}
              slot={currentDay.evening}
              colorBorder="#2C5282"
              onAskConcierge={onAskConciergeAboutPlace}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface TimelineCardProps {
  period: string;
  icon: React.ReactNode;
  slot: ItinerarySlot;
  colorBorder: string;
  onAskConcierge: (placeName: string) => void;
}

const TimelineCard: React.FC<TimelineCardProps> = ({
  period,
  icon,
  slot,
  colorBorder,
  onAskConcierge,
}) => {
  if (!slot) return null;
  const place = slot.place || {};

  return (
    <div className="glass-card" style={{
      overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      borderLeft: `4px solid ${colorBorder}`,
      background: '#FFFFFF',
    }}>
      {/* Photo Column */}
      <div style={{ position: 'relative', minHeight: '190px', background: 'var(--color-sand-100)' }}>
        <img
          src={place.image_url || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80'}
          alt={place.name || slot.activity_title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(11, 22, 38, 0.88)',
          color: '#FFFFFF',
          padding: '3px 9px',
          borderRadius: 'var(--radius-xs)',
          fontSize: '0.74rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          {icon} {period}
        </div>

        {place.area && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#101F35',
            padding: '2px 8px',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.72rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <MapPin size={10} color="#D05B3B" /> {place.area}
          </div>
        )}
      </div>

      {/* Content Column */}
      <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> {slot.time} • ({slot.duration})
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#101F35', marginTop: '3px', lineHeight: 1.35 }}>
                {slot.activity_title}
              </h4>
            </div>

            <span className="badge-pill badge-ocean" style={{ fontSize: '0.74rem' }}>
              📍 {slot.distance_from_hotel}
            </span>
          </div>

          <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '12px' }}>
            {slot.description}
          </p>

          {/* Food Tip / Recommendation */}
          {slot.food_tip && (
            <div style={{
              background: 'var(--color-sunset-100)',
              borderLeft: '3px solid var(--color-terracotta-500)',
              padding: '7px 12px',
              borderRadius: '0 4px 4px 0',
              fontSize: '0.82rem',
              color: '#8A321A',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Utensils size={13} />
              <span><strong>Dining Tip:</strong> {slot.food_tip}</span>
            </div>
          )}

          {/* Signature dishes if restaurant */}
          {place.signature_dishes && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                Signature:
              </span>
              {place.signature_dishes.map((dish: string, i: number) => (
                <span key={i} className="badge-pill badge-terracotta" style={{ fontSize: '0.72rem' }}>
                  {dish}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Meta & Action */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          borderTop: '1px solid var(--card-border)',
          paddingTop: '12px',
          marginTop: '6px'
        }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
            Estimated Budget: <strong style={{ color: '#101F35' }}>{slot.budget}</strong>
          </div>

          <button
            onClick={() => onAskConcierge(place.name || slot.activity_title)}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '5px 12px' }}
          >
            <MessageSquare size={13} color="#D05B3B" /> Ask Concierge About This
          </button>
        </div>
      </div>
    </div>
  );
};
