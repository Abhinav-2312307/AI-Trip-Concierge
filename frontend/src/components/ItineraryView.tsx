import React, { useState } from 'react';
import {
  Calendar,
  Printer,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Sun,
  Moon,
  Sunrise,
  Utensils
} from 'lucide-react';
import type { ItineraryResponse, ItinerarySlot, HotelBooking } from '../types';
import {
  downloadICSFile,
  getGoogleCalendarUrl,
  formatItineraryForClipboard
} from '../utils/calendarExport';

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
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  const days = itineraryData?.itinerary || [];
  const currentDay = days[activeDayIndex] || days[0];

  const hotelName = activeHotel?.name || itineraryData?.hotel || 'Taj Fort Aguada Resort & Spa, Goa';
  const hotelArea = activeHotel?.area || 'Sinquerim, Candolim';
  const guestName = activeHotel?.guest_name || itineraryData?.guest_name;

  const handleExportICS = () => {
    if (!itineraryData) return;
    downloadICSFile(itineraryData, hotelName, guestName);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleCopyClipboard = async () => {
    if (!itineraryData) return;
    const text = formatItineraryForClipboard(itineraryData, hotelName, guestName);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2400);
    } catch {
      alert('Itinerary copied to clipboard!');
    }
  };

  const handleGoogleCalendar = (slot: ItinerarySlot, period: string) => {
    if (!currentDay) return;
    const url = getGoogleCalendarUrl(
      slot,
      currentDay.day_number,
      period,
      currentDay.date || itineraryData?.start_date,
      hotelName
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Extract a featured image from morning or afternoon slot for the day lead image
  const dayLeadImage = currentDay?.morning?.place?.image_url ||
    currentDay?.afternoon?.place?.image_url ||
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85';

  return (
    <div style={{ marginTop: '24px', paddingBottom: '60px' }} className="animate-fade-in printable-itinerary">
      
      {/* Luxury Print-Only Header */}
      <div className="print-header" style={{ display: 'none', marginBottom: '24px', borderBottom: '2px solid var(--accent-primary)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="font-serif" style={{ fontSize: '22pt', color: 'var(--text-primary)', margin: 0 }}>
              {hotelName}
            </h1>
            <div style={{ fontSize: '11pt', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Curated Goa Itinerary • {hotelArea} • AI Trip Concierge
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '10pt', color: 'var(--text-secondary)' }}>
            {guestName && <div><strong>Guest:</strong> {guestName}</div>}
            {activeHotel?.confirmation_code && <div><strong>Ref:</strong> {activeHotel.confirmation_code}</div>}
            <div><strong>Duration:</strong> {days.length} Days</div>
          </div>
        </div>
      </div>

      {/* Editorial Header & Duration Controls */}
      <div style={{
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: '20px'
      }} className="no-print">
        <div>
          <div style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--accent-primary)',
            marginBottom: '6px'
          }}>
            YOUR TRIP JOURNAL
          </div>
          <h1 className="font-serif" style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 8px 0',
            lineHeight: 1.15
          }}>
            Day-by-Day Itinerary
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', margin: 0, maxWidth: '600px' }}>
            Sequenced with realistic travel times, sunset moments, and signature dining from {hotelName}.
          </p>
        </div>

        {/* Duration selector & Export actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-card)',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid var(--border-primary)',
          }}>
            {[1, 2, 3, 4, 5].map((d) => (
              <button
                key={d}
                onClick={() => {
                  setSelectedDays(d);
                  onGenerate(d);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: selectedDays === d ? 700 : 500,
                  cursor: 'pointer',
                  background: selectedDays === d ? 'var(--accent-primary)' : 'transparent',
                  color: selectedDays === d ? '#FFFFFF' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {d} {d === 1 ? 'Day' : 'Days'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={handleExportICS}
              className="btn-secondary"
              title="Download universal .ics file"
              style={{ padding: '8px 12px', fontSize: '0.82rem', borderRadius: '8px' }}
            >
              <Calendar size={14} color="var(--accent-primary)" /> .ICS
            </button>

            <button
              onClick={handlePrintPDF}
              className="btn-secondary"
              title="Print or Save PDF"
              style={{ padding: '8px 12px', fontSize: '0.82rem', borderRadius: '8px' }}
            >
              <Printer size={14} /> PDF
            </button>

            <button
              onClick={handleCopyClipboard}
              className="btn-secondary"
              title="Copy formatted text"
              style={{
                padding: '8px 12px',
                fontSize: '0.82rem',
                borderRadius: '8px',
                background: copiedToast ? 'rgba(16, 185, 129, 0.12)' : undefined,
                color: copiedToast ? 'var(--accent-success)' : undefined
              }}
            >
              {copiedToast ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          background: 'var(--bg-card)',
          borderRadius: '14px',
          border: '1px solid var(--border-primary)'
        }}>
          <Sparkles size={24} color="var(--accent-primary)" className="animate-spin" style={{ margin: '0 auto 16px' }} />
          <h3 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>
            Sequencing realistic day plans from {hotelArea}...
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
            Optimizing scenic coastal drives, sunset coordinates, and chef reservations.
          </p>
        </div>
      )}

      {/* Content: Editorial Travel Journal Layout */}
      {!loading && days.length > 0 && currentDay && (
        <div>
          {/* Day Selector Tabs */}
          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '8px',
            marginBottom: '24px',
            borderBottom: '1px solid var(--border-primary)'
          }} className="no-print">
            {days.map((day, idx) => {
              const isActive = activeDayIndex === idx;
              return (
                <button
                  key={day.day_number}
                  onClick={() => setActiveDayIndex(idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    padding: '8px 4px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)'
                  }}>
                    DAY {day.day_number < 10 ? `0${day.day_number}` : day.day_number}
                  </span>
                  <span style={{ fontSize: '0.94rem', fontWeight: isActive ? 700 : 500 }}>
                    {day.theme || `Exploration ${day.day_number}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Day Editorial Grid: Lead Image + Story Header on Left, Clean Timeline on Right */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '36px',
            alignItems: 'start'
          }}>
            
            {/* Left Column: Day Cover & Overview */}
            <div style={{ position: 'sticky', top: '90px' }}>
              <div style={{
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
              }}>
                <div style={{ position: 'relative', height: '320px' }}>
                  <img
                    src={dayLeadImage}
                    alt={currentDay.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(11, 22, 38, 0.2) 0%, rgba(11, 22, 38, 0.85) 100%)'
                  }} />

                  <div style={{
                    position: 'absolute',
                    bottom: '22px',
                    left: '22px',
                    right: '22px',
                    color: '#FFFFFF'
                  }}>
                    <div style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--accent-primary)',
                      marginBottom: '4px'
                    }}>
                      DAY {currentDay.day_number < 10 ? `0${currentDay.day_number}` : currentDay.day_number} • {currentDay.date_formatted || 'TODAY'}
                    </div>
                    <h2 className="font-serif" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF', margin: 0, lineHeight: 1.2 }}>
                      {currentDay.title}
                    </h2>
                  </div>
                </div>

                <div style={{ padding: '22px' }}>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    Depart from <strong style={{ color: 'var(--text-primary)' }}>{hotelName}</strong> ({hotelArea})
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55, margin: 0 }}>
                    Experience a curated progression through Goan heritage, coastal atmosphere, and evening culinary excellence.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Clean Editorial Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Slot 1: Morning */}
              {currentDay.morning && (
                <JournalTimelineCard
                  period="Morning"
                  icon={<Sunrise size={16} color="var(--accent-primary)" />}
                  slot={currentDay.morning}
                  onAskConcierge={onAskConciergeAboutPlace}
                  onAddToGoogleCalendar={() => handleGoogleCalendar(currentDay.morning, 'Morning')}
                />
              )}

              {/* Slot 2: Afternoon */}
              {currentDay.afternoon && (
                <JournalTimelineCard
                  period="Afternoon"
                  icon={<Sun size={16} color="#E28445" />}
                  slot={currentDay.afternoon}
                  onAskConcierge={onAskConciergeAboutPlace}
                  onAddToGoogleCalendar={() => handleGoogleCalendar(currentDay.afternoon, 'Afternoon')}
                />
              )}

              {/* Slot 3: Evening */}
              {currentDay.evening && (
                <JournalTimelineCard
                  period="Evening & Dinner"
                  icon={<Moon size={16} color="#D05B3B" />}
                  slot={currentDay.evening}
                  onAskConcierge={onAskConciergeAboutPlace}
                  onAddToGoogleCalendar={() => handleGoogleCalendar(currentDay.evening, 'Evening')}
                />
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface JournalTimelineCardProps {
  period: string;
  icon: React.ReactNode;
  slot: ItinerarySlot;
  onAskConcierge: (placeName: string) => void;
  onAddToGoogleCalendar: () => void;
}

const JournalTimelineCard: React.FC<JournalTimelineCardProps> = ({
  period,
  icon,
  slot,
  onAskConcierge,
  onAddToGoogleCalendar,
}) => {
  if (!slot) return null;
  const place = slot.place || {};

  return (
    <div style={{
      borderRadius: '14px',
      overflow: 'hidden',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-primary)',
      padding: '22px',
      transition: 'all 0.15s ease'
    }}>
      {/* Time & Slot Meta Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {icon}
          <span>{period}</span>
          <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>•</span>
          <span style={{ color: 'var(--text-muted)', textTransform: 'none', fontWeight: 500 }}>{slot.time} ({slot.duration})</span>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {slot.distance_from_hotel}
        </div>
      </div>

      {/* Activity Title */}
      <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
        {slot.activity_title}
      </h3>

      {place.name && place.name !== slot.activity_title && (
        <div style={{ fontSize: '0.86rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '8px' }}>
          {place.name} {place.area ? `· ${place.area}` : ''}
        </div>
      )}

      {/* Description */}
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 14px 0' }}>
        {slot.description}
      </p>

      {/* Dining Tip */}
      {slot.food_tip && (
        <div style={{
          background: 'var(--bg-tertiary)',
          borderLeft: '3px solid var(--accent-primary)',
          padding: '8px 12px',
          borderRadius: '0 6px 6px 0',
          fontSize: '0.82rem',
          color: 'var(--text-primary)',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Utensils size={13} color="var(--accent-primary)" />
          <span><strong>Curated Tip:</strong> {slot.food_tip}</span>
        </div>
      )}

      {/* Actions & Budget Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        borderTop: '1px solid var(--border-primary)',
        paddingTop: '12px',
        fontSize: '0.82rem'
      }}>
        <div style={{ color: 'var(--text-muted)' }}>
          {slot.budget && <span>Est. Budget: <strong style={{ color: 'var(--text-primary)' }}>{slot.budget}</strong></span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="no-print">
          <button
            onClick={onAddToGoogleCalendar}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 6px'
            }}
          >
            <ExternalLink size={12} /> Google Cal
          </button>

          <button
            onClick={() => onAskConcierge(place.name || slot.activity_title)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 6px'
            }}
          >
            Ask Concierge <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
