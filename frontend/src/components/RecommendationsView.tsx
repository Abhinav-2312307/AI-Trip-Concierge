import React, { useState, useEffect } from 'react';
import { Utensils, Waves, Landmark, PartyPopper, Compass, Search, MapPin, Sparkles, MessageSquare } from 'lucide-react';
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
    { id: 'all', label: 'All Places', icon: <Compass size={14} /> },
    { id: 'restaurant', label: 'Dining & Shacks', icon: <Utensils size={14} /> },
    { id: 'beach', label: 'Beaches & Coves', icon: <Waves size={14} /> },
    { id: 'culture', label: 'Heritage & Culture', icon: <Landmark size={14} /> },
    { id: 'nightlife', label: 'Sunset & Evening', icon: <PartyPopper size={14} /> },
    { id: 'activity', label: 'Adventures & Tours', icon: <Sparkles size={14} /> },
  ];

  const areas = ['all', 'Candolim', 'Assagao', 'Anjuna', 'Vagator', 'Siolim', 'Calangute', 'Panjim', 'Old Goa', 'Cavelossim', 'Majorda', 'Betalbatim', 'Benaulim', 'Palolem'];

  useEffect(() => {
    loadPlaces();
  }, [selectedCategory, selectedArea, searchQuery, hotelId]);

  const loadPlaces = async () => {
    setLoading(true);
    try {
      const data = await fetchRecommendations(hotelId, selectedCategory, selectedArea, searchQuery);
      setPlaces(data.places);
    } catch (err) {
      console.error('Failed to load places', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ marginTop: '12px' }}>
      {/* Header & Search Bar */}
      <div className="glass-card" style={{
        padding: '20px 24px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        background: '#FFFFFF',
      }}>
        <div>
          <h2 className="font-serif" style={{ fontSize: '1.45rem', fontWeight: 700, color: '#101F35', margin: 0 }}>
            Goa Places & Recommendations
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '2px', marginBottom: 0 }}>
            Verified dining, beaches, and sights with travel distances calculated from <strong>{hotelName}</strong> ({hotelArea}).
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} color="#94A3B8" style={{ position: 'absolute', top: '11px', left: '12px' }} />
          <input
            type="text"
            placeholder="Search dish, spot, or vibe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--card-border)',
              outline: 'none',
              fontSize: '0.86rem',
              background: 'var(--color-sand-50)'
            }}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        marginBottom: '12px',
        alignItems: 'center'
      }}>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid',
              borderColor: selectedCategory === c.id ? 'var(--color-ocean-900)' : 'var(--card-border)',
              background: selectedCategory === c.id ? 'var(--color-ocean-900)' : '#FFFFFF',
              color: selectedCategory === c.id ? '#FFFFFF' : '#475569',
              fontSize: '0.84rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Area Filter */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '5px',
        marginBottom: '20px',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748B', marginRight: '4px' }}>
          Area:
        </span>
        {areas.map((a) => (
          <button
            key={a}
            onClick={() => setSelectedArea(a)}
            style={{
              padding: '3px 10px',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              fontSize: '0.76rem',
              fontWeight: 500,
              cursor: 'pointer',
              background: selectedArea === a ? 'var(--color-terracotta-500)' : 'var(--color-sand-100)',
              color: selectedArea === a ? '#FFFFFF' : '#475569',
              transition: 'all 0.12s ease'
            }}
          >
            {a === 'all' ? 'All Goa' : a}
          </button>
        ))}
      </div>

      {/* Grid of Places */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '36px', color: '#64748B', fontSize: '0.88rem' }}>
          Loading curated places from {hotelName}...
        </div>
      ) : places.length === 0 ? (
        <div className="glass-card" style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontSize: '0.88rem', background: '#FFFFFF' }}>
          No places match your selected filters.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {places.map((place) => (
            <div
              key={place.id}
              className="glass-card"
              style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#FFFFFF'
              }}
            >
              <div>
                {/* Photo with Overlay Badges */}
                <div style={{ position: 'relative', height: '160px' }}>
                  <img
                    src={place.image_url}
                    alt={place.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                  <span style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(11, 22, 38, 0.88)',
                    color: '#FFFFFF',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-xs)',
                    textTransform: 'uppercase'
                  }}>
                    {place.category}
                  </span>
                  <span style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#101F35',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-xs)',
                  }}>
                    📍 {place.distance_from_hotel}
                  </span>
                </div>

                {/* Details */}
                <div style={{ padding: '16px 18px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#101F35', marginBottom: '2px' }}>
                    {place.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748B', marginBottom: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 500 }}>
                      <MapPin size={11} color="#D05B3B" /> {place.area}
                    </span>
                    <span>•</span>
                    <span>{place.price_range}</span>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.45, marginBottom: '12px' }}>
                    {place.description}
                  </p>

                  {/* Highlights / Signature Dishes */}
                  {place.signature_dishes && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                      {place.signature_dishes.slice(0, 3).map((dish, i) => (
                        <span key={i} className="badge-pill badge-terracotta" style={{ fontSize: '0.7rem' }}>
                          {dish}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{
                    background: 'var(--color-sand-100)',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.76rem',
                    color: '#475569',
                  }}>
                    <strong>Atmosphere:</strong> {place.vibe}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div style={{
                padding: '12px 18px',
                borderTop: '1px solid var(--card-border)',
                background: 'var(--color-sand-50)',
              }}>
                <button
                  onClick={() => onAskConcierge(`Tell me more about ${place.name} and how to visit from ${hotelName}.`)}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    fontSize: '0.78rem',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-xs)'
                  }}
                >
                  <MessageSquare size={12} /> Ask AI Concierge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
