import React, { useState } from 'react';
import { 
  Plane, 
  Compass, 
  Camera, 
  Heart, 
  Calendar as CalendarIcon, 
  Search, 
  SlidersHorizontal, 
  Plus, 
  ArrowRight, 
  ArrowLeft, 
  ChevronRight, 
  MapPin, 
  Edit3, 
  Share2, 
  MoreVertical, 
  Building, 
  Flame, 
  Check, 
  X,
  Palmtree,
  Sunset,
  Utensils
} from 'lucide-react';
import type { HotelBooking } from '../types';

interface BookingsViewProps {
  bookings: HotelBooking[];
  activeHotelId: string;
  guestName: string;
  onSelectBooking: (hotelId: string) => void;
  onOpenConcierge: (hotelId: string) => void;
  onPlanTrip: (hotelId: string) => void;
  onViewDetails: (hotel: HotelBooking) => void;
  onOpenNewTripModal?: () => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  activeHotelId,
  guestName: _guestName,
  onSelectBooking,
  onOpenConcierge,
  onPlanTrip,
  onViewDetails,
  onOpenNewTripModal,
}) => {
  const [activeFilterTab, setActiveFilterTab] = useState<'upcoming' | 'past' | 'saved'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [tripNotes, setTripNotes] = useState('Good food, blue waters and better company — Goa, here we come!');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState(tripNotes);
  const [copiedShare, setCopiedShare] = useState(false);
  const [memoryScrollIndex, setMemoryScrollIndex] = useState(0);
  const [likedMemories, setLikedMemories] = useState<Record<string, boolean>>({
    'baga': true,
    'aguada': true,
    'fontainhas': true,
    'vibes': true
  });

  const activeHotel = bookings.find((b) => b.id === activeHotelId) || bookings[0] || {
    id: 'taj-fort-aguada',
    name: 'Taj Fort Aguada Resort & Spa',
    area: 'Sinquerim, Candolim',
    region: 'North Goa',
    latitude: 15.4952,
    longitude: 73.7667,
    rating: 4.8,
    reviewCount: 1200,
    description: 'A heritage resort with breathtaking sea views, world-class amenities and a perfect blend of Goan charm and modern luxury.',
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85'],
    amenities: ['Beach Stay', 'Luxury Resort', 'Sunset Views', 'Local Food'],
    startingPrice: 22500,
    propertyType: 'Luxury Heritage Resort',
    rooms: []
  };

  const memoriesList = [
    {
      id: 'baga',
      title: 'Baga Beach',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
      tag: 'Sunset Walk'
    },
    {
      id: 'aguada',
      title: 'Fort Aguada',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
      tag: 'Heritage Bastion'
    },
    {
      id: 'fontainhas',
      title: 'Fontainhas',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
      tag: 'Latin Quarter'
    },
    {
      id: 'vibes',
      title: 'Goan Vibes',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      tag: 'Beach Cocktails'
    }
  ];

  const recommendations = [
    {
      id: 'south-goa',
      title: 'South Goa Escapes',
      subtitle: 'Peaceful beaches & luxury stays',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      action: () => onPlanTrip('alila-diwa-goa')
    },
    {
      id: 'water-adventures',
      title: 'Water Adventures',
      subtitle: 'Scuba, snorkeling & more',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
      action: () => onOpenConcierge(activeHotel.id)
    },
    {
      id: 'food-trails',
      title: 'Goan Food Trails',
      subtitle: 'Taste authentic Goa',
      image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
      action: () => onOpenConcierge(activeHotel.id)
    },
    {
      id: 'nightlife',
      title: 'Nightlife in Goa',
      subtitle: 'Beaches, clubs & sunsets',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      action: () => onOpenConcierge(activeHotel.id)
    }
  ];

  const handleSaveNotes = () => {
    setTripNotes(tempNotes);
    setIsEditingNotes(false);
  };

  const handleShareTrip = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2200);
    }
  };

  const handleAddToCalendar = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AI Trip Concierge//Goa Stay//EN
BEGIN:VEVENT
UID:${activeHotel.id}-${Date.now()}@aitripconcierge.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:20260918T100000Z
DTEND:20260921T180000Z
SUMMARY:Goa Trip: ${activeHotel.name}
DESCRIPTION:Luxury holiday at ${activeHotel.name}, ${activeHotel.area}. Grounded AI Trip Concierge active.
LOCATION:${activeHotel.name}, ${activeHotel.area}, Goa
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Goa_Trip_${activeHotel.name.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleHeart = (id: string) => {
    setLikedMemories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FB', color: '#0B1626', overflowX: 'hidden' }}>

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION ("Your Goa Journeys")
      ───────────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: '460px',
        padding: '36px clamp(16px, 4vw, 64px) 90px',
        backgroundImage: `
          linear-gradient(180deg, rgba(11, 22, 38, 0.45) 0%, rgba(11, 22, 38, 0.4) 45%, rgba(11, 22, 38, 0.78) 100%),
          url('https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=2200&q=88')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center 38%',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>

        {/* Top Right Handwritten Script Badge */}
        <div style={{
          position: 'absolute',
          top: '36px',
          right: 'clamp(24px, 5vw, 80px)',
          transform: 'rotate(6deg)',
          pointerEvents: 'none',
          textAlign: 'right',
          zIndex: 5
        }}>
          <div style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 'clamp(24px, 2.5vw, 36px)',
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.15,
            textShadow: '0 3px 12px rgba(0,0,0,0.6)',
            letterSpacing: '0.02em'
          }}>
            Collect
            <br />
            <span style={{ color: '#FFD180' }}>Moments</span>
            <br />
            Not Things ♡
          </div>
        </div>

        {/* Hero Text Content */}
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          width: '100%',
          paddingTop: '20px',
          position: 'relative',
          zIndex: 2
        }}>
          {/* MY TRIPS kicker */}
          <div style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#FF9E80',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            My Trips
          </div>

          {/* Headline */}
          <h1 style={{
            margin: '0 0 14px 0',
            lineHeight: 1.05
          }}>
            <span style={{
              display: 'block',
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 4.8vw, 64px)',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              textShadow: '0 3px 15px rgba(0,0,0,0.45)'
            }}>
              Your Goa
            </span>
            <span style={{
              display: 'inline-block',
              fontFamily: "'Caveat', cursive",
              fontSize: 'clamp(46px, 6.2vw, 84px)',
              fontWeight: 700,
              color: '#FF7E67',
              letterSpacing: '0.01em',
              marginTop: '-4px',
              textShadow: '0 3px 18px rgba(0,0,0,0.4)'
            }}>
              Journeys
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            color: 'rgba(255, 255, 255, 0.92)',
            fontSize: 'clamp(15px, 1.2vw, 17px)',
            fontWeight: 400,
            maxWidth: '520px',
            lineHeight: 1.55,
            margin: 0,
            textShadow: '0 2px 8px rgba(0,0,0,0.4)'
          }}>
            Relive memories, manage upcoming trips, and plan your next escape.
          </p>
        </div>

      </section>


      {/* ─────────────────────────────────────────────────────────────
          2. FLOATING STATS STRIP (4 ELEVATED CARDS)
      ───────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1360px',
        margin: '-56px auto 44px',
        padding: '0 clamp(16px, 3.5vw, 32px)',
        position: 'relative',
        zIndex: 15
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '18px'
        }}>
          {/* Card 1: Total Trips */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '22px 24px',
            boxShadow: '0 12px 32px rgba(11, 22, 38, 0.07)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: '#FFF1EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Plane size={24} color="#FF6B4A" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0B1626', lineHeight: 1.1 }}>3</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0B1626', marginTop: '2px' }}>Total Trips</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Adventures so far</div>
            </div>
          </div>

          {/* Card 2: Places Explored */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '22px 24px',
            boxShadow: '0 12px 32px rgba(11, 22, 38, 0.07)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Compass size={24} color="#3B82F6" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0B1626', lineHeight: 1.1 }}>12</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0B1626', marginTop: '2px' }}>Places Explored</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>And counting</div>
            </div>
          </div>

          {/* Card 3: Photos */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '22px 24px',
            boxShadow: '0 12px 32px rgba(11, 22, 38, 0.07)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Camera size={24} color="#10B981" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0B1626', lineHeight: 1.1 }}>248</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0B1626', marginTop: '2px' }}>Photos</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Memories captured</div>
            </div>
          </div>

          {/* Card 4: Good Vibes */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '22px 24px',
            boxShadow: '0 12px 32px rgba(11, 22, 38, 0.07)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: '#FFF1F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Heart size={24} color="#F43F5E" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0B1626', lineHeight: 1.1 }}>100%</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0B1626', marginTop: '2px' }}>Good Vibes</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Keep traveling!</div>
            </div>
          </div>
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          3. TRIP FILTERS & SEARCH / PLAN A NEW TRIP BAR
      ───────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1360px',
        margin: '0 auto 28px',
        padding: '0 clamp(16px, 3.5vw, 32px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Left: Filter Pills */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            overflowX: 'auto'
          }}>
            {/* Tab 1: Upcoming */}
            <button
              onClick={() => setActiveFilterTab('upcoming')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '9999px',
                border: 'none',
                background: activeFilterTab === 'upcoming'
                  ? 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)'
                  : '#FFFFFF',
                color: activeFilterTab === 'upcoming' ? '#FFFFFF' : '#64748B',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: activeFilterTab === 'upcoming' ? '0 4px 14px rgba(255, 107, 74, 0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
                borderWidth: activeFilterTab === 'upcoming' ? '0' : '1px',
                borderStyle: 'solid',
                borderColor: '#E2E8F0',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <CalendarIcon size={16} />
              <span>Upcoming Trips (1)</span>
            </button>

            {/* Tab 2: Past Trips */}
            <button
              onClick={() => setActiveFilterTab('past')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '9999px',
                background: activeFilterTab === 'past'
                  ? 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)'
                  : '#FFFFFF',
                color: activeFilterTab === 'past' ? '#FFFFFF' : '#64748B',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                border: activeFilterTab === 'past' ? 'none' : '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <span>Past Trips (2)</span>
            </button>

            {/* Tab 3: Saved Trips */}
            <button
              onClick={() => setActiveFilterTab('saved')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '9999px',
                background: activeFilterTab === 'saved'
                  ? 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)'
                  : '#FFFFFF',
                color: activeFilterTab === 'saved' ? '#FFFFFF' : '#64748B',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                border: activeFilterTab === 'saved' ? 'none' : '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <span>Saved Trips (3)</span>
            </button>
          </div>

          {/* Right: Search + Filter + Plan New Trip Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FFFFFF',
              borderRadius: '9999px',
              padding: '8px 16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              minWidth: '220px'
            }}>
              <Search size={16} color="#94A3B8" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your trips..."
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  color: '#0F172A',
                  background: 'transparent',
                  width: '100%'
                }}
              />
            </div>

            {/* Filter icon button */}
            <button
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
            >
              <SlidersHorizontal size={16} />
            </button>

            {/* Plan a New Trip CTA */}
            <button
              onClick={() => onOpenNewTripModal ? onOpenNewTripModal() : onPlanTrip(activeHotel.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9999px',
                padding: '10px 22px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(255, 107, 74, 0.35)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 18px rgba(255, 107, 74, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 107, 74, 0.35)';
              }}
            >
              <Plus size={16} strokeWidth={2.4} />
              <span>Plan a New Trip</span>
            </button>
          </div>
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          4. FEATURED ACTIVE / UPCOMING TRIP CARD (TAJ FORT AGUADA)
      ───────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1360px',
        margin: '0 auto 72px',
        padding: '0 clamp(16px, 3.5vw, 32px)'
      }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 16px 40px rgba(11, 22, 38, 0.06)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          alignItems: 'stretch'
        }}>

          {/* Left Column: Image with Badges */}
          <div style={{
            position: 'relative',
            minHeight: '340px',
            overflow: 'hidden'
          }}>
            <img
              src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85"
              alt="Goa Beach Trip"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />

            {/* Gradient Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.75) 100%)'
            }} />

            {/* Top Left: Upcoming Pill Badge */}
            <div style={{
              position: 'absolute',
              top: '18px',
              left: '18px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ECFDF5',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#059669',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
              <span>Upcoming</span>
            </div>

            {/* Top Right: Date Badge */}
            <div style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: 'rgba(11, 22, 38, 0.75)',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>SEP</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>18 - 21</div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>2026</div>
            </div>

            {/* Bottom Left: Location Title */}
            <div style={{
              position: 'absolute',
              bottom: '18px',
              left: '18px',
              color: '#FFFFFF'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '16px', fontWeight: 800 }}>
                <MapPin size={18} color="#FF7E67" />
                <span>Goa, India</span>
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', marginTop: '2px' }}>
                Sun, Sand & Endless Vibes
              </div>
            </div>

            {/* Bottom Right: Traveler Avatars Stack */}
            <div style={{
              position: 'absolute',
              bottom: '18px',
              right: '18px',
              display: 'flex',
              alignItems: 'center'
            }}>
              {['👤', '👤', '👤'].map((avatar, i) => (
                <div
                  key={i}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: i === 0 ? '#FF6B4A' : i === 1 ? '#3B82F6' : '#10B981',
                    border: '2px solid #FFFFFF',
                    marginLeft: i > 0 ? '-8px' : '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    color: '#FFFFFF'
                  }}
                >
                  {avatar}
                </div>
              ))}
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(11, 22, 38, 0.85)',
                border: '2px solid #FFFFFF',
                marginLeft: '-8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 700,
                color: '#FFFFFF'
              }}>
                +12
              </div>
            </div>
          </div>

          {/* Right Column: Hotel Info, Tags, Notes, Actions */}
          <div style={{
            padding: 'clamp(24px, 3.5vw, 36px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '18px'
          }}>
            <div>
              {/* Hotel Title & View Details Button */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <div>
                  <div
                    onClick={() => onViewDetails(activeHotel)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <h2 style={{
                      margin: 0,
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 'clamp(20px, 2vw, 24px)',
                      fontWeight: 700,
                      color: '#0B1626'
                    }}>
                      {activeHotel.name}
                    </h2>
                    <ChevronRight size={18} color="#64748B" />
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                    4 Days · 3 Nights · 2 Travelers
                  </div>
                </div>

                <button
                  onClick={() => onViewDetails(activeHotel)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '9999px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0F172A',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0F172A';
                    e.currentTarget.style.background = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.background = '#FFFFFF';
                  }}
                >
                  View Details
                </button>
              </div>

              {/* Tag Chips Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                margin: '18px 0 16px'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#ECFDF5',
                  color: '#065F46',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  <Palmtree size={13} color="#059669" />
                  <span>Beach Stay</span>
                </span>

                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#EFF6FF',
                  color: '#1E40AF',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  <Building size={13} color="#3B82F6" />
                  <span>Luxury Resort</span>
                </span>

                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#FEF3C7',
                  color: '#92400E',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  <Sunset size={13} color="#D97706" />
                  <span>Sunset Views</span>
                </span>

                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#FFF1EE',
                  color: '#9A3412',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  <Utensils size={13} color="#FF6B4A" />
                  <span>Local Food</span>
                </span>
              </div>

              {/* Notes Block (Quote Box) */}
              <div style={{
                background: '#FFF7F4',
                borderRadius: '14px',
                padding: '14px 18px',
                border: '1px solid rgba(255, 107, 74, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px', color: '#FF6B4A', fontWeight: 900, lineHeight: 1 }}>❝</span>
                  {isEditingNotes ? (
                    <input
                      type="text"
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #FF6B4A',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '13px',
                        width: '100%',
                        color: '#0F172A'
                      }}
                      autoFocus
                    />
                  ) : (
                    <span style={{ fontSize: '13px', color: '#475569', fontStyle: 'italic' }}>
                      {tripNotes}
                    </span>
                  )}
                </div>

                {isEditingNotes ? (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={handleSaveNotes}
                      style={{ background: '#FF6B4A', border: 'none', color: '#FFFFFF', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => { setTempNotes(tripNotes); setIsEditingNotes(false); }}
                      style={{ background: '#CBD5E1', border: 'none', color: '#0F172A', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'none',
                      border: 'none',
                      color: '#0F172A',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <Edit3 size={13} />
                    <span>Edit Notes</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Action Footer Strip */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #F1F5F9',
              paddingTop: '16px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              {/* Action 1: View Itinerary */}
              <button
                onClick={() => onPlanTrip(activeHotel.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                <CalendarIcon size={16} color="#FF6B4A" />
                <span>View Itinerary</span>
              </button>

              {/* Action 2: Hotel Details */}
              <button
                onClick={() => onViewDetails(activeHotel)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                <Building size={16} color="#3B82F6" />
                <span>Hotel Details</span>
              </button>

              {/* Action 3: Add to Calendar */}
              <button
                onClick={handleAddToCalendar}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                <CalendarIcon size={16} color="#10B981" />
                <span>Add to Calendar</span>
              </button>

              {/* Action 4: Share Trip */}
              <button
                onClick={handleShareTrip}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                {copiedShare ? <Check size={16} color="#10B981" /> : <Share2 size={16} color="#64748B" />}
                <span>{copiedShare ? 'Copied Link!' : 'Share Trip'}</span>
              </button>

              {/* Action 5: More Options */}
              <button
                onClick={() => onSelectBooking(activeHotel.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '6px'
                }}
              >
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          5. "MEMORIES FROM YOUR TRIPS" (CAROUSEL SECTION)
      ───────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1360px',
        margin: '0 auto 76px',
        padding: '0 clamp(16px, 3.5vw, 32px)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr)) 3fr',
          gap: '32px',
          alignItems: 'center'
        }}>
          {/* Left Header Column */}
          <div>
            <h2 style={{
              margin: '0 0 12px',
              lineHeight: 1.15
            }}>
              <span style={{
                display: 'block',
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(28px, 3vw, 38px)',
                fontWeight: 700,
                color: '#0B1626'
              }}>
                Memories from
              </span>
              <span style={{
                display: 'inline-block',
                fontFamily: "'Caveat', cursive",
                fontSize: 'clamp(38px, 4.2vw, 54px)',
                fontWeight: 700,
                color: '#FF7E67',
                marginTop: '-4px'
              }}>
                Your Trips
              </span>
            </h2>

            <p style={{
              fontSize: '14px',
              color: '#64748B',
              lineHeight: 1.6,
              margin: '0 0 24px',
              maxWidth: '300px'
            }}>
              A glimpse of the places you've loved and the moments you've lived.
            </p>

            <button
              onClick={() => onOpenConcierge(activeHotel.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                border: '1px solid #CBD5E1',
                borderRadius: '9999px',
                padding: '10px 22px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0F172A',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0F172A';
                e.currentTarget.style.background = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#CBD5E1';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span>View All Memories</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Right Memories Photo Cards Row with Navigation Arrows */}
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(180px, 1fr))',
              gap: '16px',
              overflowX: 'auto',
              paddingBottom: '8px'
            }}>
              {memoriesList.map((mem) => (
                <div
                  key={mem.id}
                  style={{
                    position: 'relative',
                    height: '240px',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 14px 30px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
                  }}
                >
                  <img
                    src={mem.image}
                    alt={mem.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Gradient Overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 40%, rgba(11,22,38,0.85) 100%)'
                  }} />

                  {/* Top Heart Bookmark */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleHeart(mem.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(15, 23, 42, 0.45)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Heart
                      size={15}
                      color={likedMemories[mem.id] ? '#FF4757' : '#FFFFFF'}
                      fill={likedMemories[mem.id] ? '#FF4757' : 'none'}
                    />
                  </button>

                  {/* Bottom Title */}
                  <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    right: '16px',
                    color: '#FFFFFF'
                  }}>
                    <h4 style={{
                      margin: 0,
                      fontSize: '15px',
                      fontWeight: 700,
                      textShadow: '0 2px 4px rgba(0,0,0,0.4)'
                    }}>
                      {mem.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows on Far Right */}
            <div style={{
              position: 'absolute',
              right: '-18px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              zIndex: 10
            }}>
              <button
                onClick={() => setMemoryScrollIndex(Math.max(0, memoryScrollIndex - 1))}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              >
                <ArrowLeft size={14} color="#0F172A" />
              </button>
              <button
                onClick={() => setMemoryScrollIndex(memoryScrollIndex + 1)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              >
                <ArrowRight size={14} color="#0F172A" />
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          6. "PLAN YOUR NEXT GOA STORY" (CTA BANNER)
      ───────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1360px',
        margin: '0 auto 72px',
        padding: '0 clamp(16px, 3.5vw, 32px)'
      }}>
        <div style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          padding: ' clamp(36px, 4vw, 56px) clamp(24px, 4vw, 64px)',
          backgroundImage: `
            linear-gradient(90deg, rgba(255, 246, 240, 0.95) 0%, rgba(254, 238, 230, 0.88) 50%, rgba(254, 238, 230, 0.6) 100%),
            url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid rgba(255, 126, 103, 0.2)',
          boxShadow: '0 12px 36px rgba(255, 107, 74, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '32px'
        }}>
          {/* Left Text */}
          <div style={{ maxWidth: '540px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#94A3B8',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Ready for Another Escape?
            </div>

            <h2 style={{
              margin: '0 0 14px 0',
              lineHeight: 1.15
            }}>
              <span style={{
                display: 'block',
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(28px, 3.2vw, 42px)',
                fontWeight: 800,
                color: '#0B1626'
              }}>
                Plan Your Next
              </span>
              <span style={{
                display: 'inline-block',
                fontFamily: "'Caveat', cursive",
                fontSize: 'clamp(38px, 4.4vw, 56px)',
                fontWeight: 700,
                color: '#FF7E67',
                marginTop: '-4px'
              }}>
                Goa Story
              </span>
            </h2>

            <p style={{
              fontSize: '15px',
              lineHeight: 1.6,
              color: '#475569',
              margin: '0 0 24px 0'
            }}>
              Let our AI Concierge craft a personalized itinerary based on your vibe, budget and interests.
            </p>

            <button
              onClick={() => onOpenConcierge(activeHotel.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9999px',
                padding: '13px 28px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(255, 107, 74, 0.35)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(255, 107, 74, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 74, 0.35)';
              }}
            >
              <span>Plan My Next Trip</span>
              <ArrowRight size={16} strokeWidth={2.4} />
            </button>
          </div>

          {/* Right Handwritten Script */}
          <div style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 'clamp(28px, 3vw, 42px)',
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.15,
            textAlign: 'right',
            transform: 'rotate(-6deg)',
            textShadow: '0 2px 10px rgba(0,0,0,0.25)',
            letterSpacing: '0.01em'
          }}>
            Same Beaches
            <br />
            Different Stories ♡
          </div>
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          7. "RECOMMENDED FOR YOUR NEXT TRIP"
      ───────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1360px',
        margin: '0 auto 88px',
        padding: '0 clamp(16px, 3.5vw, 32px)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Flame size={20} color="#FF6B4A" />
              <h3 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 800,
                color: '#0B1626'
              }}>
                Recommended for Your Next Trip
              </h3>
            </div>
            <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
              Based on your travel style and past trips
            </div>
          </div>

          <button
            onClick={() => onOpenConcierge(activeHotel.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              color: '#0F172A',
              cursor: 'pointer'
            }}
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}>
          {recommendations.map((item) => (
            <div
              key={item.id}
              onClick={item.action}
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 14px 28px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.04)';
              }}
            >
              {/* Image */}
              <div style={{ height: '150px', overflow: 'hidden' }}>
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease'
                  }}
                />
              </div>

              {/* Text & Chevron */}
              <div style={{
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 700, color: '#0B1626' }}>
                    {item.title}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    {item.subtitle}
                  </div>
                </div>

                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ChevronRight size={15} color="#64748B" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
