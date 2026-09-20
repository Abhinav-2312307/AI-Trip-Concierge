import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  MapPin, 
  Calendar as CalendarIcon, 
  Users, 
  ArrowRight, 
  Building, 
  Utensils, 
  Palmtree, 
  Car, 
  BookOpen, 
  Map, 
  Heart, 
  Star, 
  Clock 
} from 'lucide-react';
import type { HotelBooking } from '../types';

interface LandingPageProps {
  hotels: HotelBooking[];
  onExploreClick: () => void;
  onHotelClick: (hotel: HotelBooking) => void;
  onLoginClick?: () => void;
  onPlanTrip?: () => void;
  onJudgeDemoClick: () => void;
  onOpenConcierge?: (prompt?: string) => void;
  onOpenMap?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  hotels,
  onExploreClick,
  onHotelClick,
  onLoginClick,
  onPlanTrip,
  onJudgeDemoClick,
  onOpenConcierge,
  onOpenMap,
}) => {
  const [activeTab, setActiveTab] = useState<'stays' | 'experiences' | 'food' | 'beaches' | 'transport'>('stays');
  const [destination] = useState('Goa');
  const [dates] = useState('Sep 18, 2026 – Sep 21, 2026');
  const [travellers] = useState('2 Adults');
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fallback featured Taj Fort Aguada hotel
  const tajHotel: HotelBooking = hotels.find(h => h.id.includes('aguada')) || {
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
    amenities: ['Sea View', 'Infinity Pool', 'Spa & Wellness', 'Fine Dining'],
    startingPrice: 22500,
    propertyType: 'Luxury Heritage Resort',
    rooms: []
  };

  const categoryCards = [
    {
      id: 'luxury-stays',
      title: 'Luxury Stays',
      count: '18 Stays',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
      action: onExploreClick
    },
    {
      id: 'experiences',
      title: 'Experiences',
      count: '24 Activities',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
      action: () => onOpenConcierge ? onOpenConcierge('Recommend top outdoor adventures and water sports in Goa') : (onLoginClick ? onLoginClick() : onExploreClick())
    },
    {
      id: 'beaches',
      title: 'Beaches',
      count: '12 Beaches',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      action: () => onOpenConcierge ? onOpenConcierge('What are the most peaceful hidden beaches in North & South Goa?') : (onLoginClick ? onLoginClick() : onExploreClick())
    },
    {
      id: 'food-drinks',
      title: 'Food & Drinks',
      count: '35 Places',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      action: () => onOpenConcierge ? onOpenConcierge('Recommend authentic Goan fish thali and beach shacks') : (onLoginClick ? onLoginClick() : onExploreClick())
    },
    {
      id: 'nightlife',
      title: 'Nightlife',
      count: '15 Venues',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      action: () => onOpenConcierge ? onOpenConcierge('What are the best sunset lounges and nightlife spots in Vagator and Anjuna?') : (onLoginClick ? onLoginClick() : onExploreClick())
    }
  ];

  const travelGuides = [
    {
      id: 'best-time',
      title: 'Best Time to Visit Goa',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
      action: () => onOpenConcierge ? onOpenConcierge('What is the best month and season to visit Goa?') : (onLoginClick ? onLoginClick() : onExploreClick())
    },
    {
      id: 'top-beaches',
      title: 'Top 10 Beaches in Goa',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      action: () => onOpenConcierge ? onOpenConcierge('Give me the top 10 beaches in Goa with pros and cons') : (onLoginClick ? onLoginClick() : onExploreClick())
    },
    {
      id: 'local-food',
      title: 'Local Food You Must Try',
      image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
      action: () => onOpenConcierge ? onOpenConcierge('List the must-try Goan dishes and where to eat them') : (onLoginClick ? onLoginClick() : onExploreClick())
    },
    {
      id: 'get-around',
      title: 'How to Get Around Goa',
      image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
      action: () => onOpenConcierge ? onOpenConcierge('What is the best way to get around Goa: scooter, self-drive car, or taxi?') : (onLoginClick ? onLoginClick() : onExploreClick())
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FB', color: '#0B1626', overflowX: 'hidden' }}>

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (EXACT SUNSET BEACH WITH ARTISTIC SCRIPT)
      ───────────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: '680px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '100px clamp(16px, 4vw, 64px) 110px',
        backgroundImage: `
          linear-gradient(180deg, rgba(11, 22, 38, 0.45) 0%, rgba(11, 22, 38, 0.35) 45%, rgba(11, 22, 38, 0.75) 100%),
          url('https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=2200&q=88')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center 42%',
        color: '#FFFFFF'
      }}>
        
        {/* Top Floating Handwritten Script Badge (Top Right) */}
        <div style={{
          position: 'absolute',
          top: '90px',
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
            Sunsets,
            <br />
            <span style={{ color: '#FFD180' }}>Stories &</span>
            <br />
            Goa ♡
          </div>
        </div>

        {/* Hero Content Area */}
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          width: '100%',
          paddingTop: '28px',
          position: 'relative',
          zIndex: 2
        }}>
          
          {/* GOOD VIBES ONLY kicker */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '14px'
          }}>
            <div style={{ width: '28px', height: '2px', background: '#FF7E67' }} />
            <span style={{
              color: '#FF9E80',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase'
            }}>
              Good Vibes Only
            </span>
          </div>

          {/* Main Headline */}
          <h1 style={{
            margin: '0 0 16px 0',
            lineHeight: 1.05
          }}>
            <span style={{
              display: 'block',
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(38px, 5.2vw, 68px)',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              textShadow: '0 3px 15px rgba(0,0,0,0.45)'
            }}>
              Discover Goa,
            </span>
            <span style={{
              display: 'inline-block',
              fontFamily: "'Caveat', cursive",
              fontSize: 'clamp(48px, 6.8vw, 88px)',
              fontWeight: 700,
              color: '#FF7E67',
              letterSpacing: '0.01em',
              marginTop: '-4px',
              textShadow: '0 3px 18px rgba(0,0,0,0.4)'
            }}>
              Your Way
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            color: 'rgba(255, 255, 255, 0.92)',
            fontSize: 'clamp(15px, 1.25vw, 18px)',
            fontWeight: 400,
            maxWidth: '560px',
            lineHeight: 1.55,
            margin: '0 0 28px 0',
            textShadow: '0 2px 8px rgba(0,0,0,0.4)'
          }}>
            AI-powered itineraries, hidden gems and local experiences — curated for your perfect Goa trip.
          </p>

          {/* Hero CTAs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            flexWrap: 'wrap'
          }}>
            {/* Primary Orange Pill CTA */}
            <button
              onClick={onPlanTrip || onLoginClick || onExploreClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9999px',
                padding: '14px 28px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(255, 107, 74, 0.4)',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(255, 107, 74, 0.55)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 107, 74, 0.4)';
              }}
            >
              <span>Plan My Trip</span>
              <ArrowRight size={18} strokeWidth={2.4} />
            </button>

            {/* Glass Outline Pill CTA */}
            <button
              onClick={onExploreClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(15, 23, 42, 0.45)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '9999px',
                padding: '14px 26px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.45)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              <Building size={18} />
              <span>Explore Stays</span>
            </button>
          </div>
        </div>

        {/* Hero Bottom Metric Strip & Location Tag */}
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          position: 'relative',
          zIndex: 2,
          paddingTop: '40px'
        }}>
          {/* Left Metrics Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(14px, 2.5vw, 32px)',
            flexWrap: 'wrap'
          }}>
            {/* Metric 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={20} color="#FF9E80" />
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>10K+</div>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 500 }}>Happy Travellers</div>
              </div>
            </div>

            {/* Metric 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building size={20} color="#FF9E80" />
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>500+</div>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 500 }}>Verified Stays</div>
              </div>
            </div>

            {/* Metric 3 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={20} color="#FF9E80" />
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>100+</div>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 500 }}>Local Experiences</div>
              </div>
            </div>

            {/* Metric 4 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={20} color="#FF9E80" />
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>24/7</div>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 500 }}>AI Concierge</div>
              </div>
            </div>
          </div>

          {/* Right Location Tag */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(11, 22, 38, 0.45)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '8px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <MapPin size={18} color="#FF7E67" />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>Baga Beach, Goa</div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)' }}>Where every sunset tells a story</div>
            </div>
          </div>
        </div>

      </section>


      {/* ─────────────────────────────────────────────────────────────
          2. FLOATING TRAVEL SEARCH & INTERACTIVE ACTION HUB
      ───────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1360px',
        margin: '-64px auto 64px',
        padding: '0 clamp(16px, 3.5vw, 32px)',
        position: 'relative',
        zIndex: 15
      }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(11, 22, 38, 0.1)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>

          {/* Top Category Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(8px, 1.5vw, 16px)',
            borderBottom: '1px solid #F1F5F9',
            paddingBottom: '18px',
            overflowX: 'auto'
          }}>
            {/* Tab 1: Stays */}
            <button
              onClick={() => setActiveTab('stays')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '9999px',
                border: 'none',
                background: activeTab === 'stays' ? '#FFF1EE' : 'transparent',
                color: activeTab === 'stays' ? '#FF5A36' : '#64748B',
                fontSize: '14px',
                fontWeight: activeTab === 'stays' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Building size={16} />
              <span>Stays</span>
            </button>

            {/* Tab 2: Experiences */}
            <button
              onClick={() => setActiveTab('experiences')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '9999px',
                border: 'none',
                background: activeTab === 'experiences' ? '#FFF1EE' : 'transparent',
                color: activeTab === 'experiences' ? '#FF5A36' : '#64748B',
                fontSize: '14px',
                fontWeight: activeTab === 'experiences' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Compass size={16} />
              <span>Experiences</span>
            </button>

            {/* Tab 3: Food & Drinks */}
            <button
              onClick={() => setActiveTab('food')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '9999px',
                border: 'none',
                background: activeTab === 'food' ? '#FFF1EE' : 'transparent',
                color: activeTab === 'food' ? '#FF5A36' : '#64748B',
                fontSize: '14px',
                fontWeight: activeTab === 'food' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Utensils size={16} />
              <span>Food & Drinks</span>
            </button>

            {/* Tab 4: Beaches */}
            <button
              onClick={() => setActiveTab('beaches')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '9999px',
                border: 'none',
                background: activeTab === 'beaches' ? '#FFF1EE' : 'transparent',
                color: activeTab === 'beaches' ? '#FF5A36' : '#64748B',
                fontSize: '14px',
                fontWeight: activeTab === 'beaches' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Palmtree size={16} />
              <span>Beaches</span>
            </button>

            {/* Tab 5: Transport */}
            <button
              onClick={() => setActiveTab('transport')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '9999px',
                border: 'none',
                background: activeTab === 'transport' ? '#FFF1EE' : 'transparent',
                color: activeTab === 'transport' ? '#FF5A36' : '#64748B',
                fontSize: '14px',
                fontWeight: activeTab === 'transport' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Car size={16} />
              <span>Transport</span>
            </button>
          </div>

          {/* Search Inputs Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) auto',
            gap: '16px',
            alignItems: 'center'
          }}>
            {/* Input 1: Destination */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 18px',
              background: '#F8FAFC',
              borderRadius: '16px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#FFF1EE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <MapPin size={18} color="#FF6B4A" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Destination</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{destination}</div>
              </div>
            </div>

            {/* Input 2: Dates */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 18px',
              background: '#F8FAFC',
              borderRadius: '16px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CalendarIcon size={18} color="#3B82F6" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Check In – Check Out</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{dates}</div>
              </div>
            </div>

            {/* Input 3: Travellers */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 18px',
              background: '#F8FAFC',
              borderRadius: '16px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#F0FDF4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Users size={18} color="#22C55E" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Travellers</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{travellers}</div>
              </div>
            </div>

            {/* Action: Search Button */}
            <button
              onClick={onExploreClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '16px',
                padding: '18px 36px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(255, 107, 74, 0.35)',
                transition: 'all 0.25s ease',
                height: '100%',
                minHeight: '58px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(255, 107, 74, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 107, 74, 0.35)';
              }}
            >
              <span>Search</span>
              <ArrowRight size={18} strokeWidth={2.4} />
            </button>
          </div>

          {/* Quick Action Grid (4 Interactive Cards) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            paddingTop: '8px'
          }}>
            {/* Action 1: Ask AI Concierge */}
            <div
              onClick={() => onOpenConcierge ? onOpenConcierge('Hello! Help me plan an unforgettable trip to Goa.') : (onLoginClick ? onLoginClick() : onExploreClick())}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FF6B4A';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 107, 74, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#FFF1EE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Sparkles size={20} color="#FF6B4A" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Ask AI Concierge</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Get instant travel advice</div>
                </div>
              </div>
              <ArrowRight size={16} color="#94A3B8" />
            </div>

            {/* Action 2: Create Itinerary */}
            <div
              onClick={onPlanTrip || onLoginClick || onExploreClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3B82F6';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <BookOpen size={20} color="#3B82F6" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Create Itinerary</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Personalized day plans</div>
                </div>
              </div>
              <ArrowRight size={16} color="#94A3B8" />
            </div>

            {/* Action 3: Find Hidden Gems */}
            <div
              onClick={() => onOpenConcierge ? onOpenConcierge('Show me 5 completely offbeat hidden gems and secret viewpoints in Goa') : (onLoginClick ? onLoginClick() : onExploreClick())}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#F59E0B';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <MapPin size={20} color="#D97706" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Find Hidden Gems</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Offbeat places & local spots</div>
                </div>
              </div>
              <ArrowRight size={16} color="#94A3B8" />
            </div>

            {/* Action 4: Live Map */}
            <div
              onClick={() => onOpenMap ? onOpenMap() : onExploreClick()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#10B981';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#D1FAE5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Map size={20} color="#059669" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Live Map</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Explore Goa interactively</div>
                </div>
              </div>
              <ArrowRight size={16} color="#94A3B8" />
            </div>
          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          3. EXPLORE GOA: HANDPICKED FOR YOU (5 CATEGORY CARDS)
      ───────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1360px',
        margin: '0 auto 72px',
        padding: '0 clamp(16px, 3.5vw, 32px)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#64748B',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>
              Explore Goa
            </div>
            <h2 style={{
              margin: 0,
              fontSize: 'clamp(28px, 3.2vw, 42px)',
              lineHeight: 1.15
            }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#0B1626' }}>
                Handpicked{' '}
              </span>
              <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, color: '#FF7E67' }}>
                for You
              </span>
            </h2>
            <p style={{ margin: '8px 0 0', color: '#64748B', fontSize: '15px' }}>
              Stays, experiences, beaches and more — chosen just for your vibe.
            </p>
          </div>

          <button
            onClick={onExploreClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: '1px solid #CBD5E1',
              borderRadius: '9999px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#0F172A',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0F172A';
              e.currentTarget.style.background = '#F1F5F9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span>View All</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* 5 Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '20px'
        }}>
          {categoryCards.map((card) => (
            <div
              key={card.id}
              onClick={card.action}
              style={{
                position: 'relative',
                height: '270px',
                borderRadius: '20px',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 16px 36px rgba(0,0,0,0.14)';
                const img = e.currentTarget.querySelector('img');
                if (img) img.style.transform = 'scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
                const img = e.currentTarget.querySelector('img');
                if (img) img.style.transform = 'scale(1.0)';
              }}
            >
              {/* Background Image */}
              <img
                src={card.image}
                alt={card.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease'
                }}
              />

              {/* Gradient Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(11,22,38,0.3) 50%, rgba(11,22,38,0.85) 100%)'
              }} />

              {/* Bottom Card Content */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '20px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                color: '#FFFFFF'
              }}>
                <div>
                  <h3 style={{
                    margin: '0 0 4px',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    textShadow: '0 2px 4px rgba(0,0,0,0.4)'
                  }}>
                    {card.title}
                  </h3>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: 500
                  }}>
                    {card.count}
                  </div>
                </div>

                {/* Circular Arrow Button */}
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.95)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                  flexShrink: 0
                }}>
                  <ArrowRight size={16} color="#0F172A" strokeWidth={2.4} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          4. FEATURED STAY CARD ("TOP PICK" - TAJ FORT AGUADA)
      ───────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1360px',
        margin: '0 auto 88px',
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
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85"
              alt="Taj Fort Aguada Resort & Spa"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />

            {/* Gradient */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 40%, rgba(0,0,0,0.6) 100%)'
            }} />

            {/* Top Left: Top Pick Pill Badge */}
            <div style={{
              position: 'absolute',
              top: '18px',
              left: '18px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#0F172A',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <Sparkles size={14} color="#FF6B4A" />
              <span>Top Pick</span>
            </div>

            {/* Top Right: Heart Bookmark */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsBookmarked(!isBookmarked);
              }}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.45)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Heart
                size={18}
                color={isBookmarked ? '#FF4757' : '#FFFFFF'}
                fill={isBookmarked ? '#FF4757' : 'none'}
              />
            </button>

            {/* Bottom Left: Distance Tag */}
            <div style={{
              position: 'absolute',
              bottom: '18px',
              left: '18px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#FFFFFF'
            }}>
              <MapPin size={14} color="#FF7E67" />
              <span>4.5 km from Calangute</span>
            </div>

            {/* Bottom Right: Circular Arrow */}
            <div
              onClick={() => onHotelClick(tajHotel)}
              style={{
                position: 'absolute',
                bottom: '18px',
                right: '18px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}
            >
              <ArrowRight size={16} color="#0F172A" strokeWidth={2.4} />
            </div>
          </div>

          {/* Right Column: Hotel Details & Amenities */}
          <div style={{
            padding: ' clamp(24px, 3.5vw, 40px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px'
          }}>
            <div>
              {/* Category tag */}
              <div style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#64748B',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '6px'
              }}>
                Stay · Luxury
              </div>

              {/* Title & Price Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 'clamp(22px, 2.2vw, 28px)',
                    fontWeight: 700,
                    color: '#0B1626'
                  }}>
                    Taj Fort Aguada Resort & Spa
                  </h3>
                  {/* Rating Stars */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '8px'
                  }}>
                    <div style={{ display: 'flex', color: '#F59E0B' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                      ))}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>4.8</span>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>(1.2K reviews)</span>
                  </div>
                </div>

                {/* Price */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#0B1626' }}>₹22,500</div>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>per night</div>
                </div>
              </div>

              {/* Amenities Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
                margin: '20px 0 16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                  <span>🌊</span>
                  <span>Sea View</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                  <span>🏊</span>
                  <span>Infinity Pool</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                  <span>💆</span>
                  <span>Spa & Wellness</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                  <span>🍽️</span>
                  <span>Fine Dining</span>
                </div>
              </div>

              {/* Description */}
              <p style={{
                margin: 0,
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#64748B'
              }}>
                A heritage resort with breathtaking sea views, world-class amenities and a perfect blend of Goan charm and modern luxury.
              </p>
            </div>

            {/* View Details CTA */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
              <button
                onClick={() => onHotelClick(tajHotel)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '12px 28px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(255, 107, 74, 0.35)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 24px rgba(255, 107, 74, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(255, 107, 74, 0.35)';
                }}
              >
                <span>View Details</span>
                <ArrowRight size={16} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          5. "MORE THAN A TRIP, IT'S A FEELING" (EXPERIENCES BEYOND STAYS)
      ───────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #FFF6F0 0%, #FFEFE6 50%, #FFF3EC 100%)',
        padding: '90px clamp(16px, 4vw, 64px)',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255, 126, 103, 0.15)',
        borderBottom: '1px solid rgba(255, 126, 103, 0.15)'
      }}>
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          alignItems: 'center',
          gap: 'clamp(36px, 5vw, 72px)',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Left Column: Text & CTA */}
          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#64748B',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: '10px'
            }}>
              Experiences Beyond Stays
            </div>

            <h2 style={{
              margin: '0 0 18px 0',
              lineHeight: 1.15
            }}>
              <span style={{
                display: 'block',
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(32px, 3.8vw, 52px)',
                fontWeight: 800,
                color: '#0B1626'
              }}>
                More Than a Trip,
              </span>
              <span style={{
                display: 'inline-block',
                fontFamily: "'Caveat', cursive",
                fontSize: 'clamp(42px, 5vw, 68px)',
                fontWeight: 700,
                color: '#FF7E67',
                marginTop: '-4px'
              }}>
                It's a Feeling
              </span>
            </h2>

            <p style={{
              fontSize: '16px',
              lineHeight: 1.65,
              color: '#475569',
              maxWidth: '480px',
              margin: '0 0 32px 0'
            }}>
              From thrilling water sports to peaceful sunset cruises, Goa has something for every kind of traveller.
            </p>

            <button
              onClick={() => onOpenConcierge ? onOpenConcierge('Show me curated Goan experiences: boat cruises, spice plantations, water sports, and beach shacks') : (onLoginClick ? onLoginClick() : onExploreClick())}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: '#0B1626',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9999px',
                padding: '15px 32px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(11, 22, 38, 0.25)',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(11, 22, 38, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(11, 22, 38, 0.25)';
              }}
            >
              <span>Explore Experiences</span>
              <ArrowRight size={18} />
            </button>

            {/* Handwritten Note Annotation */}
            <div style={{
              marginTop: '44px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                fontFamily: "'Caveat', cursive",
                fontSize: '24px',
                fontWeight: 700,
                color: '#334155',
                lineHeight: 1.15
              }}>
                Collect
                <br />
                Moments
                <br />
                Not Things ♡
              </div>
              <div style={{
                fontSize: '28px',
                color: '#64748B',
                transform: 'rotate(20deg) scaleX(-1)'
              }}>
                ⤷
              </div>
            </div>
          </div>

          {/* Right Column: Vintage Polaroid Collage with Postal Stamp */}
          <div style={{
            position: 'relative',
            minHeight: '420px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            
            {/* Postal Stamp Badge Overlay */}
            <div style={{
              position: 'absolute',
              top: '0px',
              right: '10%',
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              border: '2px dashed #94A3B8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'rotate(15deg)',
              color: '#64748B',
              zIndex: 10,
              pointerEvents: 'none',
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(4px)'
            }}>
              <div style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em' }}>ORIGINAL</div>
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#FF7E67' }}>GOA</div>
              <div style={{ fontSize: '8px', fontWeight: 700 }}>RESORT</div>
            </div>

            {/* Polaroid 1: Adventure (Tilted Left) */}
            <div style={{
              position: 'absolute',
              left: '5%',
              top: '10%',
              width: '180px',
              background: '#FFFFFF',
              padding: '10px 10px 24px',
              borderRadius: '8px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
              transform: 'rotate(-10deg)',
              transition: 'transform 0.3s ease',
              zIndex: 2,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(-10deg) scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotate(-10deg) scale(1)'; }}
            >
              <img
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=500&q=80"
                alt="Adventure"
                style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '4px' }}
              />
              <div style={{
                fontFamily: "'Caveat', cursive",
                fontSize: '18px',
                fontWeight: 700,
                textAlign: 'center',
                color: '#334155',
                marginTop: '8px'
              }}>
                Adventure
              </div>
            </div>

            {/* Polaroid 2: Romance (Centered) */}
            <div style={{
              position: 'relative',
              width: '210px',
              background: '#FFFFFF',
              padding: '12px 12px 28px',
              borderRadius: '8px',
              boxShadow: '0 16px 36px rgba(0,0,0,0.16)',
              transform: 'rotate(2deg)',
              zIndex: 3,
              cursor: 'pointer',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(2deg) scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotate(2deg) scale(1)'; }}
            >
              <img
                src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=500&q=80"
                alt="Romance"
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '4px' }}
              />
              <div style={{
                fontFamily: "'Caveat', cursive",
                fontSize: '20px',
                fontWeight: 700,
                textAlign: 'center',
                color: '#334155',
                marginTop: '10px'
              }}>
                Romance
              </div>
            </div>

            {/* Polaroid 3: Relax (Tilted Right) */}
            <div style={{
              position: 'absolute',
              right: '5%',
              top: '12%',
              width: '180px',
              background: '#FFFFFF',
              padding: '10px 10px 24px',
              borderRadius: '8px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
              transform: 'rotate(12deg)',
              zIndex: 1,
              cursor: 'pointer',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(12deg) scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotate(12deg) scale(1)'; }}
            >
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80"
                alt="Relax"
                style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '4px' }}
              />
              <div style={{
                fontFamily: "'Caveat', cursive",
                fontSize: '18px',
                fontWeight: 700,
                textAlign: 'center',
                color: '#334155',
                marginTop: '8px'
              }}>
                Relax
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          6. "PLAN BETTER, TRAVEL SMARTER" (TRAVEL GUIDES)
      ───────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1360px',
        margin: '0 auto 88px',
        padding: '80px clamp(16px, 3.5vw, 32px) 0'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#64748B',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>
              Travel Guides
            </div>
            <h2 style={{
              margin: 0,
              fontSize: 'clamp(28px, 3.2vw, 42px)',
              lineHeight: 1.15
            }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#0B1626' }}>
                Plan Better,{' '}
              </span>
              <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, color: '#FF7E67' }}>
                Travel Smarter
              </span>
            </h2>
            <p style={{ margin: '8px 0 0', color: '#64748B', fontSize: '15px' }}>
              Tips, itineraries, local insights and everything you need for an amazing Goa trip.
            </p>
          </div>

          <button
            onClick={() => onOpenConcierge ? onOpenConcierge('Show me all Goa travel guides: weather, transport, hidden gems, and dining etiquette') : (onLoginClick ? onLoginClick() : onExploreClick())}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: '1px solid #CBD5E1',
              borderRadius: '9999px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#0F172A',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0F172A';
              e.currentTarget.style.background = '#F1F5F9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span>View All</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* 4 Guides Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}>
          {travelGuides.map((guide) => (
            <div
              key={guide.id}
              onClick={guide.action}
              style={{
                position: 'relative',
                height: '240px',
                borderRadius: '20px',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 16px 36px rgba(0,0,0,0.14)';
                const img = e.currentTarget.querySelector('img');
                if (img) img.style.transform = 'scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
                const img = e.currentTarget.querySelector('img');
                if (img) img.style.transform = 'scale(1.0)';
              }}
            >
              {/* Image */}
              <img
                src={guide.image}
                alt={guide.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease'
                }}
              />

              {/* Gradient */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(11,22,38,0.3) 40%, rgba(11,22,38,0.85) 100%)'
              }} />

              {/* Content */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#FFFFFF'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  maxWidth: '80%'
                }}>
                  {guide.title}
                </h3>

                {/* Circular Arrow Button */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.95)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                  flexShrink: 0
                }}>
                  <ArrowRight size={15} color="#0F172A" strokeWidth={2.4} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          7. CLEAN LUXURY FOOTER (MATCHING REFERENCE DESIGN)
      ───────────────────────────────────────────────────────────── */}
      <footer style={{
        background: '#0B1626',
        color: '#FFFFFF',
        padding: '32px clamp(16px, 4vw, 64px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          {/* Left Brand */}
          <div style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: 500
          }}>
            <span style={{ fontWeight: 700, color: '#FFFFFF' }}>AI Trip Concierge</span> · Goa Traveller OS
          </div>

          {/* Center Links */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}>
            {['About', 'Help', 'Privacy', 'Contact'].map((link) => (
              <a
                key={link}
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.65)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)'; }}
              >
                {link}
              </a>
            ))}
          </div>

          {/* Right: Socials & Good Vibes Signature */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              color: 'rgba(255, 255, 255, 0.6)'
            }}>
              <span style={{ cursor: 'pointer', fontSize: '13px' }}>📷</span>
              <span style={{ cursor: 'pointer', fontSize: '13px' }}>▶</span>
              <span style={{ cursor: 'pointer', fontSize: '13px' }}>𝕏</span>
              <span style={{ cursor: 'pointer', fontSize: '13px' }}>f</span>
            </div>

            <div style={{
              fontFamily: "'Caveat', cursive",
              fontSize: '20px',
              fontWeight: 700,
              color: '#FF7E67',
              letterSpacing: '0.02em'
            }}>
              Good Vibes Only ♡
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
