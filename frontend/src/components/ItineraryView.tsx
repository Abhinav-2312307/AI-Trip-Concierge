import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Sparkles,
  Utensils,
  Sun,
  Moon,
  Sunrise,
  Navigation,
  MessageSquare,
  Calendar,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Share2
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
  const hotelArea = activeHotel?.area || 'Candolim, Goa';
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
      // Fallback
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

  return (
    <div style={{ marginTop: '12px' }} className="animate-fade-in printable-itinerary">
      
      {/* Luxury Print-Only Header */}
      <div className="print-header" style={{ display: 'none', marginBottom: '24px', borderBottom: '2px solid var(--accent-primary)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="font-serif" style={{ fontSize: '22pt', color: 'var(--text-primary)', margin: 0 }}>
              {hotelName}
            </h1>
            <div style={{ fontSize: '11pt', color: 'var(--text-secondary)', marginTop: '4px' }}>
              🌴 Curated Goa Itinerary • {hotelArea} • AI Trip Concierge
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '10pt', color: 'var(--text-secondary)' }}>
            {guestName && <div><strong>Guest:</strong> {guestName}</div>}
            {activeHotel?.confirmation_code && <div><strong>Booking Ref:</strong> {activeHotel.confirmation_code}</div>}
            <div><strong>Duration:</strong> {days.length} Days</div>
          </div>
        </div>
      </div>

      {/* Planner Header & Duration Control */}
      <div className="glass-card no-print" style={{
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
      }}>
        <div>
          <h2 className="font-serif" style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Curated Day-by-Day Itinerary
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
            Personalized route sequenced realistically from <strong>{hotelName}</strong> ({hotelArea}).
          </p>
        </div>

        {/* Days Selector & Generate Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-tertiary)',
            padding: '3px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-primary)',
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0 8px' }}>
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
                  background: selectedDays === d ? 'var(--accent-secondary)' : 'transparent',
                  color: selectedDays === d ? '#FFFFFF' : 'var(--text-secondary)',
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

      {/* Export & Calendar Action Bar */}
      {!loading && days.length > 0 && (
        <div className="glass-card no-print" style={{
          padding: '12px 20px',
          marginBottom: '20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '30px',
              height: '30px',
              borderRadius: 'var(--radius-xs)',
              background: 'rgba(208, 91, 59, 0.12)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Share2 size={16} />
            </span>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Export & Take Your Itinerary
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Sync with phone calendar or save a luxury printable summary
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Download ICS */}
            <button
              onClick={handleExportICS}
              className="btn-secondary"
              title="Download universal .ics file for Apple Calendar, Outlook, and Android"
              style={{
                fontSize: '0.8rem',
                padding: '6px 13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Calendar size={14} color="var(--accent-primary)" /> Download .ICS
            </button>

            {/* Print / Save PDF */}
            <button
              onClick={handlePrintPDF}
              className="btn-secondary"
              title="Print or Save as high-resolution PDF"
              style={{
                fontSize: '0.8rem',
                padding: '6px 13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Printer size={14} color="var(--accent-secondary)" /> Print / PDF
            </button>

            {/* Copy WhatsApp / Text */}
            <button
              onClick={handleCopyClipboard}
              className="btn-secondary"
              title="Copy clean formatted itinerary text for WhatsApp or Email"
              style={{
                fontSize: '0.8rem',
                padding: '6px 13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: copiedToast ? 'rgba(16, 185, 129, 0.12)' : undefined,
                borderColor: copiedToast ? 'var(--accent-success)' : undefined,
                color: copiedToast ? 'var(--accent-success)' : undefined,
                transition: 'all 0.2s ease',
              }}
            >
              {copiedToast ? (
                <>
                  <Check size={14} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy Itinerary
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton Shimmer State */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header Skeleton */}
          <div className="glass-card" style={{
            padding: '22px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
          }}>
            <Sparkles size={24} color="var(--accent-primary)" className="animate-spin" />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Sequencing Day Plans from {hotelName}...
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '3px 0 0' }}>
                Calculating seaside routes, sunset schedules, and chef-recommended dining from {hotelArea}.
              </p>
            </div>
          </div>

          {/* 3 Day-Slot Shimmer Skeletons */}
          {[1, 2, 3].map((slotIdx) => (
            <div
              key={slotIdx}
              className="glass-card"
              style={{
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: '260px 1fr',
                borderLeft: `4px solid var(--border-primary)`,
                minHeight: '190px',
                background: 'var(--bg-card)',
              }}
            >
              <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }} />
              <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div className="skeleton-shimmer" style={{ width: '120px', height: '14px' }} />
                    <div className="skeleton-shimmer" style={{ width: '70px', height: '18px', borderRadius: '4px' }} />
                  </div>
                  <div className="skeleton-shimmer" style={{ width: '60%', height: '22px', marginBottom: '12px' }} />
                  <div className="skeleton-shimmer" style={{ width: '100%', height: '13px', marginBottom: '6px' }} />
                  <div className="skeleton-shimmer" style={{ width: '85%', height: '13px', marginBottom: '14px' }} />
                  <div className="skeleton-shimmer" style={{ width: '90%', height: '30px', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
                  <div className="skeleton-shimmer" style={{ width: '100px', height: '14px' }} />
                  <div className="skeleton-shimmer" style={{ width: '130px', height: '26px', borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Itinerary Content */}
      {!loading && days.length > 0 && currentDay && (
        <div>
          {/* Day Navigation Tabs */}
          <div className="no-print" style={{
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
                  borderColor: activeDayIndex === idx ? 'var(--accent-secondary)' : 'var(--border-primary)',
                  background: activeDayIndex === idx ? 'var(--bg-card)' : 'var(--bg-tertiary)',
                  color: activeDayIndex === idx ? 'var(--accent-secondary)' : 'var(--text-secondary)',
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
                  background: activeDayIndex === idx ? 'var(--accent-secondary)' : 'var(--border-primary)',
                  color: '#FFFFFF',
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
            background: 'var(--accent-secondary)',
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
              <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2px', color: '#FFFFFF' }}>
                {currentDay.title}
              </h3>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Navigation size={13} color="var(--accent-primary)" /> Depart from {hotelName}
            </div>
          </div>

          {/* Timeline Cards: Morning, Afternoon, Evening */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Morning Slot */}
            <TimelineCard
              period="Morning"
              icon={<Sunrise size={17} color="var(--accent-primary)" />}
              slot={currentDay.morning}
              colorBorder="var(--accent-primary)"
              onAskConcierge={onAskConciergeAboutPlace}
              onAddToGoogleCalendar={() => handleGoogleCalendar(currentDay.morning, 'Morning')}
            />

            {/* Afternoon Slot */}
            <TimelineCard
              period="Afternoon"
              icon={<Sun size={17} color="var(--accent-warning)" />}
              slot={currentDay.afternoon}
              colorBorder="var(--accent-warning)"
              onAskConcierge={onAskConciergeAboutPlace}
              onAddToGoogleCalendar={() => handleGoogleCalendar(currentDay.afternoon, 'Afternoon')}
            />

            {/* Evening Slot */}
            <TimelineCard
              period="Evening & Dinner"
              icon={<Moon size={17} color="var(--accent-secondary)" />}
              slot={currentDay.evening}
              colorBorder="var(--accent-secondary)"
              onAskConcierge={onAskConciergeAboutPlace}
              onAddToGoogleCalendar={() => handleGoogleCalendar(currentDay.evening, 'Evening')}
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
  onAddToGoogleCalendar: () => void;
}

const TimelineCard: React.FC<TimelineCardProps> = ({
  period,
  icon,
  slot,
  colorBorder,
  onAskConcierge,
  onAddToGoogleCalendar,
}) => {
  if (!slot) return null;
  const place = slot.place || {};

  return (
    <div className="glass-card card-interactive" style={{
      overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      borderLeft: `4px solid ${colorBorder}`,
      background: 'var(--bg-card)',
      border: '1px solid var(--border-primary)',
      borderLeftWidth: '4px',
      borderLeftColor: colorBorder,
    }}>
      {/* Photo Column */}
      <div style={{ position: 'relative', minHeight: '190px', background: 'var(--bg-tertiary)' }}>
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
            <MapPin size={10} color="var(--accent-primary)" /> {place.area}
          </div>
        )}
      </div>

      {/* Content Column */}
      <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> {slot.time} • ({slot.duration})
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '3px', lineHeight: 1.35 }}>
                {slot.activity_title}
              </h4>
            </div>

            <span className="badge-pill badge-ocean" style={{ fontSize: '0.74rem' }}>
              📍 {slot.distance_from_hotel}
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '12px' }}>
            {slot.description}
          </p>

          {/* Food Tip / Recommendation */}
          {slot.food_tip && (
            <div style={{
              background: 'var(--bg-tertiary)',
              borderLeft: '3px solid var(--accent-primary)',
              padding: '7px 12px',
              borderRadius: '0 4px 4px 0',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Utensils size={13} color="var(--accent-primary)" />
              <span><strong>Dining Tip:</strong> {slot.food_tip}</span>
            </div>
          )}

          {/* Signature dishes if restaurant */}
          {place.signature_dishes && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
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
          borderTop: '1px solid var(--border-primary)',
          paddingTop: '12px',
          marginTop: '6px'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Estimated Budget: <strong style={{ color: 'var(--text-primary)' }}>{slot.budget}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onAddToGoogleCalendar}
              className="btn-secondary no-print"
              title="Add this activity to Google Calendar"
              style={{ fontSize: '0.78rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <ExternalLink size={12} /> Google Cal
            </button>

            <button
              onClick={() => onAskConcierge(place.name || slot.activity_title)}
              className="btn-secondary no-print"
              style={{ fontSize: '0.78rem', padding: '5px 12px' }}
            >
              <MessageSquare size={13} color="var(--accent-primary)" /> Ask Concierge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
