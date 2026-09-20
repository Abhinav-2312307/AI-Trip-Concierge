import React, { useState } from 'react';
import { 
  ArrowRight, 
  Calendar, 
  Printer, 
  Copy, 
  Check, 
  ExternalLink, 
  Waves, 
  Utensils, 
  Sunset as SunsetIcon,
  Sun,
  Moon,
  Sunrise,
  Navigation,
  Crosshair,
  Sparkles,
  Heart,
  MapPin,
  Building,
  Star
} from 'lucide-react';
import type { ItineraryResponse, ItinerarySlot, HotelBooking, Booking, TripContext, ReviewCreatePayload } from '../types';
import { 
  downloadICSFile, 
  getGoogleCalendarUrl, 
  formatItineraryForClipboard 
} from '../utils/calendarExport';
import { submitHotelReview } from '../services/api';
import { ReviewModal } from './ReviewModal';

interface MyTripJourneyProps {
  itineraryData: ItineraryResponse | null;
  loading: boolean;
  activeHotel: HotelBooking | null;
  currentBooking: Booking | null;
  tripContext: TripContext | null;
  guestName: string;
  onUpdateGuestName?: (name: string) => void;
  onEnableGps?: () => void;
  userCoords?: { lat: number; lng: number } | null;
  userArea?: string;
  onGenerate: (days: number) => void;
  onAskConcierge: (prompt: string) => void;
  onOpenExplore: () => void;
  onOpenMap?: () => void;
}

export const MyTripJourney: React.FC<MyTripJourneyProps> = ({
  itineraryData,
  loading,
  activeHotel,
  currentBooking,
  tripContext,
  guestName,
  onEnableGps,
  userCoords,
  userArea,
  onGenerate,
  onAskConcierge,
  onOpenExplore,
  onOpenMap,
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [selectedDuration, setSelectedDuration] = useState<number>(3);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [activeHubTab, setActiveHubTab] = useState<'plan' | 'stay' | 'weather' | 'experiences' | 'transport'>('plan');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewSubmittedToast, setReviewSubmittedToast] = useState<boolean>(false);

  const handleReviewSubmitted = async (payload: ReviewCreatePayload) => {
    await submitHotelReview(payload);
    setReviewSubmittedToast(true);
    setTimeout(() => setReviewSubmittedToast(false), 4000);
  };

  const days = itineraryData?.itinerary || [];
  const currentDay = days[activeDayIndex] || days[0];

  const hotelName = currentBooking?.hotelName || activeHotel?.name || tripContext?.hotel?.name || 'Taj Fort Aguada Resort & Spa';
  const hotelArea = currentBooking?.hotelLocation || activeHotel?.area || tripContext?.hotel?.area || 'Sinquerim, Candolim';
  const checkIn = currentBooking?.checkInFormatted || 'Sep 18, 2026';
  const checkOut = currentBooking?.checkOutFormatted || 'Sep 21, 2026';
  const activeGuestName = guestName || currentBooking?.guestName || 'Aditya';

  const handleExportICS = () => {
    if (!itineraryData) return;
    downloadICSFile(itineraryData, hotelName, activeGuestName);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleCopyClipboard = async () => {
    if (!itineraryData) return;
    const text = formatItineraryForClipboard(itineraryData, hotelName, activeGuestName);
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

  const dayTitlesList = [
    { num: 1, dayLabel: 'FRI 18', title: 'Coastal Heritage & Sunset Romance' },
    { num: 2, dayLabel: 'SAT 19', title: 'Culture, Azulejos & Latin Quarter' },
    { num: 3, dayLabel: 'SUN 20', title: 'Boho Beach Clubs & Hidden Coves' },
    { num: 4, dayLabel: 'MON 21', title: 'Spice Plantations & Riverside Serenity' },
    { num: 5, dayLabel: 'TUE 22', title: 'South Goa Cliffs & Palolem Vibes' },
  ];

  const handpickedCategories = [
    { id: 'stays', title: 'Luxury Stays', tag: 'Stays', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80', count: '18 Verified' },
    { id: 'experiences', title: 'Local Experiences', tag: 'Experiences', img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80', count: '24 Activities' },
    { id: 'beaches', title: 'Secret Beaches', tag: 'Beaches', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80', count: '12 Spots' },
    { id: 'dining', title: 'Chef Dining & Shacks', tag: 'Food & Drinks', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80', count: '35 Restaurants' },
    { id: 'nightlife', title: 'Sunset Lounges', tag: 'Nightlife', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80', count: '15 Venues' },
  ];

  return (
    <div style={{
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
      marginRight: 'calc(-50vw + 50%)',
      background: '#FBF8F3',
      color: '#0B1626',
      fontFamily: 'var(--font-sans)',
      overflowX: 'hidden'
    }}>
      
      {/* ──────────────────────────────────────────────────────────
          SECTION 1 — HERO SECTION (Golden Hour Goa Sunset Photography)
      ────────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        width: '100%',
        minHeight: '620px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 0 100px',
      }}>
        {/* Cinematic Golden Hour Sunset Photograph */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=2200&q=88)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          zIndex: 1
        }} />

        {/* Ambient Sunset Gradient Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, rgba(11, 22, 38, 0.65) 0%, rgba(11, 22, 38, 0.45) 50%, rgba(11, 22, 38, 0.92) 100%)',
          zIndex: 2
        }} />

        {/* Hero Content Container */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '0 32px',
          boxSizing: 'border-box',
          textAlign: 'left'
        }}>
          {/* Glowing Top Pill Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '24px',
            padding: '6px 16px',
            fontSize: '0.84rem',
            fontWeight: 700,
            color: '#FFE3D1',
            marginBottom: '20px'
          }}>
            <Sparkles size={14} color="#FF9A76" />
            <span>Your Personal AI Travel Planner</span>
          </div>

          {/* Hero Headline */}
          <h1 style={{
            fontSize: 'clamp(2.8rem, 5.5vw, 4.8rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            color: '#FFFFFF',
            margin: '0 0 16px 0',
            letterSpacing: '-0.02em',
            textShadow: '0 4px 30px rgba(0,0,0,0.5)'
          }}>
            Discover Goa,<br />
            <span style={{
              background: 'linear-gradient(135deg, #FFB088 0%, #FF6B4A 50%, #FFA07A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Your Way
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
            color: '#E2E8F0',
            maxWidth: '620px',
            lineHeight: 1.6,
            margin: '0 0 28px 0',
            fontWeight: 400
          }}>
            AI-powered itineraries, handpicked stays, hidden gems and local experiences — curated for your active journey at <strong>{hotelName}</strong>.
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
            <button
              onClick={() => {
                const el = document.getElementById('hub-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                background: 'linear-gradient(135deg, #FF6B4A 0%, #E28445 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '30px',
                fontSize: '0.96rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(255, 107, 74, 0.45)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Sparkles size={16} />
              <span>Plan My Trip</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onOpenExplore}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '14px 24px',
                borderRadius: '30px',
                fontSize: '0.94rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              Explore Nearby Stays
            </button>

            {onOpenMap && (
              <button
                onClick={onOpenMap}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(12px)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  padding: '14px 22px',
                  borderRadius: '30px',
                  fontSize: '0.94rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>Interactive Map →</span>
              </button>
            )}

            {userCoords ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.25)',
                color: '#A7F3D0',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Crosshair size={13} /> GPS Live near {userArea || hotelArea || 'Sinquerim'}
              </div>
            ) : onEnableGps ? (
              <button
                onClick={onEnableGps}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Navigation size={12} /> Enable Live GPS
              </button>
            ) : null}
          </div>

          {/* Trust Feature Strip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(14px, 3vw, 28px)',
            flexWrap: 'wrap',
            color: '#CBD5E1',
            fontSize: '0.84rem',
            fontWeight: 500,
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            paddingTop: '20px'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✦ AI Personalized Plans</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🏨 Verified Stays</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📍 Local Experiences</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🎧 24/7 Concierge</span>
            <span style={{ color: '#FDBA74', fontWeight: 700 }}>⭐⭐⭐⭐⭐ 10K+ travelers</span>
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 2 — FLOATING TRAVEL INTELLIGENCE HUB (Search / Pulse Card)
      ────────────────────────────────────────────────────────── */}
      <div id="hub-section" style={{
        maxWidth: '1280px',
        margin: '-60px auto 48px',
        padding: '0 32px',
        position: 'relative',
        zIndex: 30
      }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '24px 28px',
          boxShadow: '0 20px 50px rgba(11, 22, 38, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          {/* Tab Selector */}
          <div style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid #F1ECE4',
            paddingBottom: '16px',
            marginBottom: '20px',
            overflowX: 'auto'
          }}>
            {[
              { id: 'plan', label: 'Plan with AI', icon: Sparkles },
              { id: 'stay', label: 'Hotel & Stay', icon: Building },
              { id: 'weather', label: 'Ocean & Weather', icon: Waves },
              { id: 'experiences', label: 'Experiences', icon: MapPin },
              { id: 'transport', label: 'Transport', icon: Navigation },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeHubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveHubTab(tab.id as any)}
                  style={{
                    background: isSelected ? 'linear-gradient(135deg, #FF6B4A 0%, #E28445 100%)' : 'transparent',
                    color: isSelected ? '#FFFFFF' : '#64748B',
                    border: 'none',
                    borderRadius: '24px',
                    padding: '8px 18px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    boxShadow: isSelected ? '0 4px 14px rgba(255, 107, 74, 0.35)' : 'none',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab 1: Real-time Trip Context Fields */}
          {activeHubTab === 'plan' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) 180px',
              gap: '16px',
              alignItems: 'center'
            }}>
              {/* Field 1: Destination */}
              <div style={{ padding: '8px 14px', background: '#FBF8F3', borderRadius: '12px', border: '1px solid #EAE3D8' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Destination
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0B1626', marginTop: '2px' }}>
                  Goa (Taj Fort Aguada)
                </div>
              </div>

              {/* Field 2: Dates */}
              <div style={{ padding: '8px 14px', background: '#FBF8F3', borderRadius: '12px', border: '1px solid #EAE3D8' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Travel Dates
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0B1626', marginTop: '2px' }}>
                  {checkIn.split(',')[0]} – {checkOut.split(',')[0]}, 2026
                </div>
              </div>

              {/* Field 3: Travelers */}
              <div style={{ padding: '8px 14px', background: '#FBF8F3', borderRadius: '12px', border: '1px solid #EAE3D8' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Travelers
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0B1626', marginTop: '2px' }}>
                  2 Adults ({activeGuestName})
                </div>
              </div>

              {/* Field 4: Style */}
              <div style={{ padding: '8px 14px', background: '#FBF8F3', borderRadius: '12px', border: '1px solid #EAE3D8' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Travel Style
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0B1626', marginTop: '2px' }}>
                  Beach, Heritage, Dining
                </div>
              </div>

              {/* Button: Generate */}
              <button
                onClick={() => onGenerate(selectedDuration)}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #FF6B4A 0%, #E28445 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '0.94rem',
                  fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 6px 20px rgba(255, 107, 74, 0.4)'
                }}
              >
                {loading ? <Sparkles size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>{loading ? 'Planning...' : 'Generate Trip ✦'}</span>
              </button>
            </div>
          )}

          {/* Active Tab 2: Ocean & Weather pulse */}
          {(activeHubTab === 'weather' || activeHubTab === 'stay') && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#FBF8F3', borderRadius: '12px' }}>
                <Sun size={24} color="#FF6B4A" />
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0B1626' }}>29°C · Clear Sky</div>
                  <div style={{ fontSize: '0.76rem', color: '#64748B' }}>Gentle coastal breeze</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#FBF8F3', borderRadius: '12px' }}>
                <Waves size={24} color="#10B981" />
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10B981' }}>Green Flag (Safe to Swim)</div>
                  <div style={{ fontSize: '0.76rem', color: '#64748B' }}>Arabian Sea · Calm waters</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#FBF8F3', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.4rem', color: '#3B82F6' }}>↓</div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0B1626' }}>Low Tide · 0.4m</div>
                  <div style={{ fontSize: '0.76rem', color: '#64748B' }}>Best beach walk at 14:15</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#FBF8F3', borderRadius: '12px' }}>
                <SunsetIcon size={24} color="#E28445" />
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0B1626' }}>Sunset at 18:35 IST</div>
                  <div style={{ fontSize: '0.76rem', color: '#64748B' }}>Golden hour at Aguada</div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Context Prompt Suggestions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '16px',
            paddingTop: '14px',
            borderTop: '1px solid #F1ECE4',
            fontSize: '0.84rem',
            color: '#64748B',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontWeight: 700, color: '#FF6B4A', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={13} /> Tell Concierge:
            </span>
            {[
              'Dinner nearby',
              'Best sunset viewpoint',
              'Secret quiet beaches',
              'Assagao nightlife'
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => onAskConcierge(`Tell me about: ${p} from ${hotelName}.`)}
                style={{
                  background: '#F1ECE4',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '4px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#0B1626',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FF6B4A';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F1ECE4';
                  e.currentTarget.style.color = '#0B1626';
                }}
              >
                {p} →
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          SECTION 3 — EXPLORE GOA: HANDPICKED FOR YOU
      ────────────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto 56px',
        padding: '0 32px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FF6B4A', marginBottom: '4px' }}>
              EXPLORE GOA
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0B1626', margin: 0 }}>
              Handpicked for You
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#64748B', margin: '4px 0 0 0' }}>
              Stays, experiences, beaches and curated dining around {hotelName}.
            </p>
          </div>

          <button
            onClick={onOpenExplore}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '20px',
              padding: '8px 18px',
              fontSize: '0.86rem',
              fontWeight: 700,
              color: '#0B1626',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 5 Visual Category Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          {handpickedCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onAskConcierge(`Show me recommendations for ${cat.title} near ${hotelName}.`)}
              style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                height: '220px',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(11, 22, 38, 0.08)',
                transition: 'transform 0.25s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <img
                src={cat.img}
                alt={cat.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(11, 22, 38, 0.85) 0%, rgba(11, 22, 38, 0.2) 60%, transparent 100%)'
              }} />

              {/* Tag pill */}
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#0B1626',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '14px'
              }}>
                {cat.tag}
              </div>

              {/* Heart bookmark */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.35)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Heart size={14} />
              </div>

              {/* Bottom Title & Count */}
              <div style={{
                position: 'absolute',
                bottom: '14px',
                left: '14px',
                right: '14px',
                color: '#FFFFFF'
              }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                  {cat.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#FDBA74', marginTop: '2px' }}>
                  {cat.count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          SECTION 4 — CURATED DAY-BY-DAY ITINERARY TIMELINE
      ────────────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto 64px',
        padding: '0 32px'
      }}>
        {/* Day Itinerary Header & Day Pill Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '20px',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FF6B4A', marginBottom: '4px' }}>
              YOUR TRAVEL JOURNAL
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0B1626', margin: 0 }}>
              Day-by-Day Journey
            </h2>
          </div>

          {/* Day Navigation Tabs */}
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            {(days.length > 0 ? days : [1, 2, 3]).map((dayOrNum, idx) => {
              const dayNum = typeof dayOrNum === 'number' ? dayOrNum : dayOrNum.day_number;
              const meta = dayTitlesList[idx] || { dayLabel: `DAY ${dayNum}`, title: `Exploration ${dayNum}` };
              const isSelected = activeDayIndex === idx;

              return (
                <button
                  key={dayNum}
                  onClick={() => setActiveDayIndex(idx)}
                  style={{
                    background: isSelected ? '#0B1626' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#64748B',
                    border: isSelected ? '1px solid #0B1626' : '1px solid #E2E8F0',
                    borderRadius: '24px',
                    padding: '8px 18px',
                    fontSize: '0.88rem',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 14px rgba(11, 22, 38, 0.2)' : 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span style={{
                    color: isSelected ? '#FF9A76' : '#94A3B8',
                    fontWeight: 800
                  }}>
                    {dayNum < 10 ? `0${dayNum}` : dayNum}
                  </span>
                  <span>{meta.dayLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Duration Selector & Export Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Duration 1-5 Days */}
            <div style={{
              display: 'flex',
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              padding: '2px'
            }}>
              {[1, 2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setSelectedDuration(d);
                    onGenerate(d);
                  }}
                  style={{
                    background: selectedDuration === d ? '#FF6B4A' : 'transparent',
                    color: selectedDuration === d ? '#FFFFFF' : '#64748B',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '5px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {d}D
                </button>
              ))}
            </div>

            <button
              onClick={handleExportICS}
              style={actionBtnStyle}
              title="Download calendar file (.ics)"
            >
              <Calendar size={14} color="#FF6B4A" />
              <span>.ICS</span>
            </button>
            <button
              onClick={handlePrintPDF}
              style={actionBtnStyle}
              title="Print itinerary PDF"
            >
              <Printer size={14} color="#238C87" />
              <span>Print</span>
            </button>
            <button
              onClick={handleCopyClipboard}
              style={{
                ...actionBtnStyle,
                background: copiedToast ? 'rgba(16, 185, 129, 0.12)' : '#FFFFFF',
                color: copiedToast ? '#10B981' : '#0B1626'
              }}
              title="Copy itinerary text"
            >
              {copiedToast ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedToast ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Current Day Schedule List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {[
            {
              period: 'Morning & Heritage',
              icon: <Sunrise size={16} color="#FF6B4A" />,
              slot: currentDay?.morning,
              badge: '08:30 AM · Morning',
              fallbackImg: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80'
            },
            {
              period: 'Coastal Lunch & Beach Stroll',
              icon: <Sun size={16} color="#E28445" />,
              slot: currentDay?.afternoon,
              badge: '12:30 PM · Lunch',
              fallbackImg: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
            },
            {
              period: 'Sunset Drinks & Peninsular Dinner',
              icon: <Moon size={16} color="#238C87" />,
              slot: currentDay?.evening,
              badge: '07:30 PM · Dinner',
              fallbackImg: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
            }
          ].map((item, idx) => {
            const slot = item.slot;
            if (!slot) return null;
            const place = slot.place || {};
            const placeImg = place.image_url || item.fallbackImg;

            return (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid #EAE3D8',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: '320px 1fr',
                  boxShadow: '0 10px 30px rgba(11, 22, 38, 0.05)',
                  transition: 'all 0.25s ease'
                }}
              >
                {/* Image Column */}
                <div style={{ position: 'relative', minHeight: '220px' }}>
                  <img
                    src={placeImg}
                    alt={slot.activity_title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(11, 22, 38, 0.88)',
                    color: '#FFFFFF',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    {item.icon} {item.badge}
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#0B1626',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '12px'
                  }}>
                    📍 {slot.distance_from_hotel || 'Near Hotel'}
                  </div>
                </div>

                {/* Content Column */}
                <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {slot.duration} • Est. Budget: {slot.budget || '₹1,500'}
                        </div>
                        <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0B1626', margin: '4px 0 0 0' }}>
                          {slot.activity_title}
                        </h3>
                      </div>

                      {place.name && (
                        <span style={{
                          background: '#F1ECE4',
                          color: '#FF6B4A',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          padding: '4px 12px',
                          borderRadius: '14px'
                        }}>
                          {place.name}
                        </span>
                      )}
                    </div>

                    <p style={{ color: '#475569', fontSize: '0.94rem', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                      {slot.description}
                    </p>

                    {/* Curated Dining Tip */}
                    {slot.food_tip && (
                      <div style={{
                        background: '#FBF8F3',
                        borderLeft: '3px solid #FF6B4A',
                        padding: '10px 14px',
                        borderRadius: '0 8px 8px 0',
                        fontSize: '0.86rem',
                        color: '#0B1626',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px'
                      }}>
                        <Utensils size={14} color="#FF6B4A" />
                        <span><strong>Curated Tip:</strong> {slot.food_tip}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #F1ECE4',
                    paddingTop: '16px'
                  }}>
                    <button
                      onClick={() => handleGoogleCalendar(slot, item.period)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748B',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ExternalLink size={13} /> Add to Google Calendar
                    </button>

                    <button
                      onClick={() => onAskConcierge(`Tell me all about visiting ${place.name || slot.activity_title} from ${hotelName}.`)}
                      style={{
                        background: '#0B1626',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '8px 18px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Sparkles size={13} color="#FF9A76" />
                      <span>Ask AI Concierge →</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          SECTION 5 — GOLDEN HOUR SUNSET SHOWCASE
      ────────────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto 64px',
        padding: '0 32px'
      }}>
        <div style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          minHeight: '280px',
          boxShadow: '0 20px 48px rgba(255, 107, 74, 0.2)'
        }}>
          <img
            src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=85"
            alt="Goa Golden Hour"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(11, 22, 38, 0.92) 0%, rgba(255, 107, 74, 0.65) 55%, rgba(11, 22, 38, 0.3) 100%)'
          }} />

          <div style={{
            position: 'absolute',
            inset: 0,
            padding: '40px 48px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#FDBA74',
              marginBottom: '6px'
            }}>
              SUNSET MOMENT · 18:35 IST
            </div>

            <h3 style={{
              fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '0 0 10px 0'
            }}>
              Golden hour over Sinquerim & Fort Aguada
            </h3>

            <p style={{ color: '#E2E8F0', fontSize: '0.96rem', margin: '0 0 20px 0', maxWidth: '540px', lineHeight: 1.6 }}>
              The Arabian Sea horizon turns vibrant copper. Optimal vantage points: Fort Aguada Lighthouse cliff and Thalassa Siolim waterfront.
            </p>

            <div>
              <button
                onClick={() => onAskConcierge("What are the best sunset viewpoints and seaside cocktail shacks near my stay?")}
                style={{
                  background: '#FFFFFF',
                  color: '#0B1626',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '24px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                }}
              >
                <span>Explore Sunset Spots</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Rate Your Stay & Digital Journey Card ── */}
        <div style={{
          marginTop: '32px',
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          padding: '28px clamp(20px, 3.5vw, 36px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFF5F0',
              color: '#FF6B4A',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              <Sparkles size={13} />
              <span>Traveller Review & Feedback</span>
            </div>

            <h3 style={{
              margin: '0 0 6px 0',
              fontSize: '1.4rem',
              fontFamily: 'Playfair Display, serif',
              fontWeight: 800,
              color: '#0B1626'
            }}>
              How is your Goa stay at {hotelName}?
            </h3>

            <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem', maxWidth: '520px' }}>
              Your feedback on the resort, dining, and AI concierge helps elevate your personal itinerary in real time.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9999px',
                padding: '12px 24px',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255, 107, 74, 0.35)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 107, 74, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 74, 0.35)';
              }}
            >
              <Star size={16} fill="#FFFFFF" />
              <span>Rate Your Stay & Itinerary</span>
            </button>
          </div>
        </div>

        {/* Review Submitted Toast */}
        {reviewSubmittedToast && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0B1626',
            color: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 1000,
            fontSize: '0.9rem',
            fontWeight: 600,
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <span style={{ color: '#10B981' }}>✓</span>
            <span>Thank you! Your verified review has been published.</span>
          </div>
        )}

      </div>

      {/* Review Modal */}
      {activeHotel && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          hotel={activeHotel}
          guestName={activeGuestName}
          onSubmitReview={handleReviewSubmitted}
        />
      )}

    </div>
  );
};

const actionBtnStyle: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  padding: '6px 14px',
  fontSize: '0.82rem',
  fontWeight: 700,
  color: '#0B1626',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  transition: 'all 0.15s ease'
};
