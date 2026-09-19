import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  ArrowRight, 
  Star, 
  Compass, 
  Waves, 
  Sparkles, 
  RotateCcw 
} from 'lucide-react';
import type { HotelBooking } from '../types';
import { fetchBookings } from '../services/api';

interface HotelDiscoveryProps {
  onSelectHotel: (hotel: HotelBooking) => void;
  onBookHotel?: (hotel: HotelBooking) => void;
}

export const HotelDiscovery: React.FC<HotelDiscoveryProps> = ({
  onSelectHotel,
}) => {
  const [hotels, setHotels] = useState<HotelBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [region, setRegion] = useState<string>('All Goa');
  const [area, setArea] = useState<string>('All Localities');
  const [maxPrice, setMaxPrice] = useState<number>(60000);
  const [amenityFilter, setAmenityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended');

  const loadHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBookings(search, region, area, maxPrice);
      setHotels(res.hotels || []);
    } catch (err: any) {
      console.error('Error fetching hotels:', err);
      setError(err.message || 'Unable to load Goa stays. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, [search, region, area, maxPrice]);

  const handleResetFilters = () => {
    setSearch('');
    setRegion('All Goa');
    setArea('All Localities');
    setMaxPrice(60000);
    setAmenityFilter('all');
    setSortBy('recommended');
  };

  // Filter by amenity if selected
  const filteredHotels = hotels.filter((hotel) => {
    if (amenityFilter === 'all') return true;
    const amenities = (hotel.amenities || []).map((a) => a.toLowerCase());
    if (amenityFilter === 'beach') return amenities.some((a) => a.includes('beach') || a.includes('ocean'));
    if (amenityFilter === 'pool') return amenities.some((a) => a.includes('pool'));
    if (amenityFilter === 'spa') return amenities.some((a) => a.includes('spa') || a.includes('ayurved'));
    return true;
  });

  // Sort hotels
  const sortedHotels = [...filteredHotels].sort((a, b) => {
    if (sortBy === 'price-asc') return (a.startingPrice || 0) - (b.startingPrice || 0);
    if (sortBy === 'price-desc') return (b.startingPrice || 0) - (a.startingPrice || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0; // recommended default
  });

  const firstHalfHotels = sortedHotels.slice(0, 3);
  const secondHalfHotels = sortedHotels.slice(3);

  return (
    <div style={{ minHeight: '100vh', background: '#FBF8F3', color: '#0B1626', paddingBottom: '96px' }}>
      
      {/* ─────────────────────────────────────────────────────────────
          1. REFINED EDITORIAL INTRO
      ───────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '48px 24px 28px'
      }}>
        <div style={{ maxWidth: '780px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#D05B3B',
            marginBottom: '14px'
          }}>
            <span style={{ width: '18px', height: '1.5px', background: '#D05B3B' }} />
            <span>Goa Stays</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 4.5vw, 3.5rem)',
            fontFamily: 'Playfair Display, Georgia, serif',
            fontWeight: 700,
            lineHeight: 1.1,
            color: '#0B1626',
            margin: '0 0 16px 0',
            letterSpacing: '-0.02em'
          }}>
            Find a stay that<br />
            <span style={{ fontStyle: 'italic', fontWeight: 400, color: '#D05B3B' }}>
              fits your Goa.
            </span>
          </h1>

          <p style={{
            fontSize: '1.08rem',
            lineHeight: 1.6,
            color: '#64748B',
            margin: 0,
            maxWidth: '620px'
          }}>
            From heritage bastions in Sinquerim to cliffside sanctuaries in Vagator, choose your base and let your journey unfold from there.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. UNIFIED SEARCH & CONTROL BAR
      ───────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px 28px'
      }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid rgba(11, 22, 38, 0.08)',
          boxShadow: '0 4px 20px rgba(11, 22, 38, 0.04)',
          padding: '8px 12px 8px 20px',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Main Keyword Search Field */}
          <div style={{
            flex: '2 1 240px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Search size={18} color="#94A3B8" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stays, areas or experiences (e.g. Taj, Vagator, Pool)..."
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.94rem',
                color: '#0B1626',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ width: '1px', height: '28px', background: '#E2E8F0' }} className="search-divider" />

          {/* Region Picker */}
          <div style={{
            flex: '1 1 150px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MapPin size={16} color="#D05B3B" />
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setArea('All Localities');
              }}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#0B1626',
                cursor: 'pointer'
              }}
            >
              <option value="All Goa">All Goa</option>
              <option value="North Goa">North Goa</option>
              <option value="South Goa">South Goa</option>
            </select>
          </div>

          <div style={{ width: '1px', height: '28px', background: '#E2E8F0' }} className="search-divider" />

          {/* Locality Picker */}
          <div style={{
            flex: '1 1 150px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Compass size={16} color="#64748B" />
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#0B1626',
                cursor: 'pointer'
              }}
            >
              <option value="All Localities">All Localities</option>
              {region !== 'South Goa' && <option value="Candolim">Candolim / Sinquerim</option>}
              {region !== 'South Goa' && <option value="Vagator">Vagator</option>}
              {region !== 'South Goa' && <option value="Anjuna">Anjuna</option>}
              {region !== 'North Goa' && <option value="Arossim">Arossim</option>}
              {region !== 'North Goa' && <option value="Majorda">Majorda</option>}
              {region !== 'North Goa' && <option value="Cansaulim">Cansaulim</option>}
            </select>
          </div>

          {/* Action Trigger */}
          <button
            onClick={loadHotels}
            style={{
              background: '#D05B3B',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.2s ease',
              boxShadow: '0 2px 8px rgba(208, 91, 59, 0.2)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#B94D32'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#D05B3B'}
          >
            <span>Search</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* ── SECONDARY FILTER CHIPS ROW ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: '16px'
        }}>
          {/* Quick Category Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '4px' }}>
              Filters:
            </span>

            <button
              onClick={() => setAmenityFilter('all')}
              style={filterChipStyle(amenityFilter === 'all')}
            >
              All Stays
            </button>

            <button
              onClick={() => setAmenityFilter('beach')}
              style={filterChipStyle(amenityFilter === 'beach')}
            >
              <Waves size={13} style={{ marginRight: '4px' }} /> Beachfront
            </button>

            <button
              onClick={() => setAmenityFilter('pool')}
              style={filterChipStyle(amenityFilter === 'pool')}
            >
              <Sparkles size={13} style={{ marginRight: '4px' }} /> Pool & Cabanas
            </button>

            <button
              onClick={() => setAmenityFilter('spa')}
              style={filterChipStyle(amenityFilter === 'spa')}
            >
              <Compass size={13} style={{ marginRight: '4px' }} /> Spa & Wellness
            </button>
          </div>

          {/* Reset Filters Option */}
          {(search || region !== 'All Goa' || area !== 'All Localities' || amenityFilter !== 'all' || maxPrice < 60000) && (
            <button
              onClick={handleResetFilters}
              style={{
                background: 'none',
                border: 'none',
                color: '#D05B3B',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RotateCcw size={12} /> Reset filters
            </button>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. RESULT COUNT & SORT ROW
      ───────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid rgba(11, 22, 38, 0.06)',
        marginBottom: '36px'
      }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0B1626' }}>
          {loading ? (
            'Looking for available stays...'
          ) : (
            `${sortedHotels.length} ${sortedHotels.length === 1 ? 'place' : 'places'} to stay in Goa`
          )}
        </div>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#64748B' }}>
          <span>Sort by</span>
          <div style={{ position: 'relative' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#0B1626',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. HOTEL GRID (TOP HALF)
      ───────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        
        {loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '32px'
          }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  padding: '16px'
                }}
              >
                <div style={{ width: '100%', height: '240px', background: '#F1F5F9', borderRadius: '12px', marginBottom: '16px' }} />
                <div style={{ width: '40%', height: '14px', background: '#F1F5F9', borderRadius: '4px', marginBottom: '10px' }} />
                <div style={{ width: '75%', height: '22px', background: '#F1F5F9', borderRadius: '4px', marginBottom: '12px' }} />
                <div style={{ width: '100%', height: '14px', background: '#F1F5F9', borderRadius: '4px', marginBottom: '6px' }} />
                <div style={{ width: '60%', height: '14px', background: '#F1F5F9', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '64px 20px',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            maxWidth: '540px',
            margin: '0 auto'
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0B1626', marginBottom: '8px' }}>
              Unable to load Goa stays
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '20px' }}>
              {error}
            </p>
            <button
              onClick={loadHotels}
              style={{
                background: '#D05B3B',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && sortedHotels.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            maxWidth: '560px',
            margin: '0 auto'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontFamily: 'Playfair Display, serif', color: '#0B1626', marginBottom: '8px' }}>
              No stays match your criteria
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#64748B', marginBottom: '24px' }}>
              Try loosening your search terms, changing the region, or resetting filters.
            </p>
            <button
              onClick={handleResetFilters}
              style={{
                background: '#D05B3B',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              View all 6 Goa stays
            </button>
          </div>
        )}

        {/* First 3 Stays Grid */}
        {!loading && firstHalfHotels.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '32px',
            marginBottom: '48px'
          }}>
            {firstHalfHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onSelect={() => onSelectHotel(hotel)}
              />
            ))}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            5. MID-PAGE EDITORIAL DISCOVERY STRIP
        ───────────────────────────────────────────────────────────── */}
        {!loading && sortedHotels.length >= 3 && (
          <section style={{
            margin: '64px 0',
            background: '#FFFFFF',
            borderRadius: '18px',
            border: '1px solid #E2E8F0',
            padding: '40px 36px',
            boxShadow: '0 4px 20px rgba(11, 22, 38, 0.03)'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '28px'
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#D05B3B' }}>
                Goa Coastlines
              </span>
              <h2 style={{ fontSize: '1.8rem', fontFamily: 'Playfair Display, serif', color: '#0B1626', margin: '6px 0 0' }}>
                Where do you want to wake up?
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {/* North Goa Box */}
              <div
                onClick={() => {
                  setRegion('North Goa');
                  setArea('All Localities');
                }}
                style={{
                  background: region === 'North Goa' ? 'rgba(208, 91, 59, 0.04)' : '#F8FAFC',
                  border: region === 'North Goa' ? '1.5px solid #D05B3B' : '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0B1626', marginBottom: '6px' }}>
                  North Goa
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#D05B3B', marginBottom: '8px' }}>
                  Sinquerim · Vagator · Anjuna
                </div>
                <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  Dramatic cliffside sunsets, Portuguese fortress ramparts, and vibrant heritage dining courtyards.
                </p>
              </div>

              {/* South Goa Box */}
              <div
                onClick={() => {
                  setRegion('South Goa');
                  setArea('All Localities');
                }}
                style={{
                  background: region === 'South Goa' ? 'rgba(208, 91, 59, 0.04)' : '#F8FAFC',
                  border: region === 'South Goa' ? '1.5px solid #D05B3B' : '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0B1626', marginBottom: '6px' }}>
                  South Goa
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#D05B3B', marginBottom: '8px' }}>
                  Arossim · Majorda · Cansaulim
                </div>
                <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  Expansive uncrowded white sands, serene emerald paddy fields, and secluded village luxury.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Second Half Stays Grid */}
        {!loading && secondHalfHotels.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '32px'
          }}>
            {secondHalfHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onSelect={() => onSelectHotel(hotel)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Embedded CSS */}
      <style>{`
        @media (max-width: 768px) {
          .search-divider {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// EDITORIAL HOTEL CARD COMPONENT
// ─────────────────────────────────────────────────────────────
interface HotelCardProps {
  hotel: HotelBooking;
  onSelect: () => void;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  const heroImage = hotel.images?.[0] || hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
  const price = hotel.startingPrice || 22000;
  const rating = hotel.rating || 4.8;
  const reviews = hotel.reviewCount || 1200;

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: isHovered ? '0 12px 30px rgba(11, 22, 38, 0.08)' : '0 2px 10px rgba(11, 22, 38, 0.03)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Hotel Image with Smooth Zoom */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '240px',
        overflow: 'hidden',
        background: '#F1F5F9'
      }}>
        <img
          src={heroImage}
          alt={hotel.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
            transform: isHovered ? 'scale(1.025)' : 'scale(1)'
          }}
        />

        {/* Region Tag */}
        <span style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: '#0B1626',
          color: '#FFFFFF',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '0.74rem',
          fontWeight: 700,
          letterSpacing: '0.02em'
        }}>
          {hotel.region}
        </span>
      </div>

      {/* Card Information Body */}
      <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Metadata Line: Area + Subtle Rating */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px'
        }}>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#64748B'
          }}>
            {hotel.area}
          </span>

          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '0.84rem',
            fontWeight: 700,
            color: '#0B1626'
          }}>
            <Star size={13} fill="#F59E0B" color="#F59E0B" />
            <span>{rating}</span>
            <span style={{ color: '#94A3B8', fontWeight: 500, fontSize: '0.76rem' }}>({reviews.toLocaleString()})</span>
          </span>
        </div>

        {/* Hotel Name */}
        <h3 style={{
          fontSize: '1.28rem',
          fontFamily: 'Playfair Display, Georgia, serif',
          fontWeight: 700,
          color: '#0B1626',
          margin: '0 0 8px 0',
          lineHeight: 1.25
        }}>
          {hotel.name}
        </h3>

        {/* Short Description */}
        <p style={{
          fontSize: '0.88rem',
          color: '#64748B',
          lineHeight: 1.5,
          margin: '0 0 20px 0',
          flex: 1
        }}>
          {hotel.description ? hotel.description.slice(0, 110) + '...' : ''}
        </p>

        {/* Bottom Price & Single CTA Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '14px',
          borderTop: '1px solid #F1F5F9'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Starting from</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#D05B3B' }}>
              ₹{price.toLocaleString('en-IN')}{' '}
              <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#64748B' }}>/ night</span>
            </div>
          </div>

          {/* Simple Clean Text CTA with Arrow Animation */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#0B1626',
            fontSize: '0.88rem',
            fontWeight: 700,
            transition: 'color 0.2s ease'
          }}>
            <span>View stay</span>
            <ArrowRight
              size={15}
              color="#D05B3B"
              style={{
                transition: 'transform 0.2s ease',
                transform: isHovered ? 'translateX(4px)' : 'translateX(0)'
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

function filterChipStyle(isActive: boolean): React.CSSProperties {
  return {
    background: isActive ? 'rgba(208, 91, 59, 0.08)' : '#FFFFFF',
    color: isActive ? '#D05B3B' : '#475569',
    border: isActive ? '1px solid rgba(208, 91, 59, 0.3)' : '1px solid #E2E8F0',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: isActive ? 700 : 500,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.18s ease'
  };
}
