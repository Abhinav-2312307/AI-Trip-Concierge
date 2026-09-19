import React, { useState, useEffect } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import type { Place, HotelBooking } from '../types';
import { fetchRecommendations } from '../services/api';

interface RecommendationsViewProps {
  activeHotel: HotelBooking | null;
  onAskConcierge: (placeName: string) => void;
  onSelectPlace?: (place: Place) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  activeHotel,
  onAskConcierge,
}) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const hotelName = activeHotel?.name || 'Taj Fort Aguada Resort & Spa, Goa';
  const hotelArea = activeHotel?.area || 'Sinquerim, Candolim';
  const hotelId = activeHotel?.id || 'taj-fort-aguada';

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'restaurant', label: 'Dining' },
    { id: 'beach', label: 'Beaches' },
    { id: 'culture', label: 'Culture' },
    { id: 'nightlife', label: 'Sunset & Drinks' },
    { id: 'activity', label: 'Adventure' },
  ];

  const popularAreas = ['all', 'Candolim', 'Assagao', 'Anjuna', 'Vagator', 'Siolim', 'Panjim', 'Majorda'];

  useEffect(() => {
    loadPlaces();
  }, [selectedCategory, selectedArea, searchQuery, hotelId]);

  const loadPlaces = async () => {
    setLoading(true);
    try {
      const data = await fetchRecommendations(hotelId, selectedCategory, selectedArea, searchQuery);
      setPlaces(data.places || []);
    } catch (err) {
      console.error('Failed to load places', err);
    } finally {
      setLoading(false);
    }
  };

  const featuredPlace = places.length > 0 ? places[0] : null;
  const secondaryPlaces = places.length > 1 ? places.slice(1, 3) : [];
  const remainingPlaces = places.length > 3 ? places.slice(3) : [];

  return (
    <div className="animate-fade-in" style={{ marginTop: '24px', paddingBottom: '60px' }}>
      
      {/* Editorial Directory Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--accent-primary)',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>DISCOVER THE ISLAND</span>
          <span>•</span>
          <span>CURATED FROM {hotelArea.toUpperCase()}</span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h1 className="font-serif" style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              margin: '0 0 10px 0'
            }}>
              Places worth leaving the hotel for.
            </h1>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '1.02rem',
              maxWidth: '650px',
              margin: 0,
              lineHeight: 1.5
            }}>
              Restaurants, beaches, heritage and hidden corners — curated around your stay at {hotelName}.
            </p>
          </div>

          {/* Minimal Search Field */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '300px'
          }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '12px', left: '14px' }} />
            <input
              type="text"
              placeholder="Search place, dish, or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '8px',
                border: '1px solid var(--border-primary)',
                outline: 'none',
                fontSize: '0.88rem',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                transition: 'border-color 0.2s',
              }}
            />
          </div>
        </div>
      </div>

      {/* Lightweight Navigation & Area Filters */}
      <div style={{
        borderBottom: '1px solid var(--border-primary)',
        paddingBottom: '14px',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Simple Category Text Tabs */}
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '2px' }}>
          {categories.map((c) => {
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: isSelected ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  padding: '4px 0 8px 0',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '0.92rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Minimal Area Exploration Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Area:
          </span>
          {popularAreas.map((a) => {
            const isAreaActive = selectedArea === a;
            return (
              <button
                key={a}
                onClick={() => setSelectedArea(a)}
                style={{
                  background: isAreaActive ? 'var(--bg-tertiary)' : 'transparent',
                  border: isAreaActive ? '1px solid var(--border-primary)' : '1px solid transparent',
                  color: isAreaActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  borderRadius: '6px',
                  padding: '3px 9px',
                  fontSize: '0.8rem',
                  fontWeight: isAreaActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.12s'
                }}
              >
                {a === 'all' ? 'All Goa' : a}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
              <div className="skeleton-shimmer" style={{ width: '100%', height: '240px' }} />
              <div style={{ padding: '18px' }}>
                <div className="skeleton-shimmer" style={{ width: '35%', height: '12px', marginBottom: '10px' }} />
                <div className="skeleton-shimmer" style={{ width: '75%', height: '22px', marginBottom: '10px' }} />
                <div className="skeleton-shimmer" style={{ width: '50%', height: '14px', marginBottom: '14px' }} />
                <div className="skeleton-shimmer" style={{ width: '100%', height: '14px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : places.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          background: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-muted)'
        }}>
          <p style={{ fontSize: '1.05rem', margin: 0 }}>No recommendations found matching your current filter.</p>
          <button
            onClick={() => { setSelectedCategory('all'); setSelectedArea('all'); setSearchQuery(''); }}
            style={{
              marginTop: '12px',
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Section 1: Editorial Asymmetric Layout (Featured 1 + Stacked 2) */}
          {featuredPlace && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}>
              {/* Featured Large Place (Left Column) */}
              <div
                className="card-interactive"
                onClick={() => onAskConcierge(`Tell me all about visiting ${featuredPlace.name} from ${hotelName}.`)}
                style={{
                  gridColumn: secondaryPlaces.length > 0 ? 'span 2' : 'span 1',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  minHeight: '440px'
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '290px', overflow: 'hidden' }}>
                  <img
                    src={featuredPlace.image_url}
                    alt={featuredPlace.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                  <div style={{
                    position: 'absolute',
                    top: '14px',
                    left: '14px',
                    background: 'rgba(11, 22, 38, 0.88)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    FEATURED • {featuredPlace.area}
                  </div>
                </div>

                <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                  <div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                      {featuredPlace.vibe || featuredPlace.category}
                    </div>
                    <h2 className="font-serif" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                      {featuredPlace.name}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                      {featuredPlace.description}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-primary)',
                    paddingTop: '14px',
                    fontSize: '0.84rem'
                  }}>
                    <div style={{ color: 'var(--text-muted)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{featuredPlace.price_range}</strong>
                      <span style={{ margin: '0 6px' }}>•</span>
                      <span>{featuredPlace.distance_from_hotel}</span>
                    </div>

                    <span style={{
                      color: 'var(--accent-primary)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      Ask Concierge <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Stacked 2 Secondary Places (Right Column) */}
              {secondaryPlaces.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {secondaryPlaces.map((place) => (
                    <div
                      key={place.id}
                      className="card-interactive"
                      onClick={() => onAskConcierge(`Tell me all about visiting ${place.name} from ${hotelName}.`)}
                      style={{
                        borderRadius: '14px',
                        overflow: 'hidden',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-primary)',
                        display: 'flex',
                        flexDirection: 'row',
                        cursor: 'pointer',
                        height: '208px'
                      }}
                    >
                      <div style={{ position: 'relative', width: '40%', height: '100%', flexShrink: 0 }}>
                        <img
                          src={place.image_url}
                          alt={place.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                        />
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          background: 'rgba(11, 22, 38, 0.88)',
                          color: '#FFFFFF',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {place.area}
                        </div>
                      </div>

                      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                        <div>
                          <h3 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                            {place.name}
                          </h3>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            {place.vibe}
                          </div>
                          <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.82rem',
                            lineHeight: 1.4,
                            margin: 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {place.description}
                          </p>
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)'
                        }}>
                          <span>{place.distance_from_hotel}</span>
                          <span style={{ color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            Details <ArrowRight size={12} />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Clean 3-Column Editorial Grid for Remaining Recommendations */}
          {remainingPlaces.length > 0 && (
            <div>
              <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '18px' }}>
                More Curated Highlights
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                {remainingPlaces.map((place) => (
                  <div
                    key={place.id}
                    className="card-interactive"
                    onClick={() => onAskConcierge(`Tell me all about visiting ${place.name} from ${hotelName}.`)}
                    style={{
                      borderRadius: '14px',
                      overflow: 'hidden',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-primary)',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                      <img
                        src={place.image_url}
                        alt={place.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'rgba(11, 22, 38, 0.88)',
                        color: '#FFFFFF',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '4px'
                      }}>
                        {place.area}
                      </div>
                    </div>

                    <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                      <div>
                        <h4 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                          {place.name}
                        </h4>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                          {place.vibe}
                        </div>
                        <p style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.86rem',
                          lineHeight: 1.45,
                          margin: '0 0 14px 0',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {place.description}
                        </p>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid var(--border-primary)',
                        paddingTop: '12px',
                        fontSize: '0.82rem'
                      }}>
                        <span style={{ color: 'var(--text-muted)' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>{place.price_range}</strong> • {place.distance_from_hotel}
                        </span>

                        <span style={{
                          color: 'var(--accent-primary)',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          Ask Concierge <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
