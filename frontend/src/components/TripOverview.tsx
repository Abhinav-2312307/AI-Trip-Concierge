import React, { useState } from 'react';
import { Sparkles, Utensils, Waves, MapPin, Search } from 'lucide-react';
import type { TripContext } from '../types';

interface TripOverviewProps {
  tripContext: TripContext | null;
  guestName: string;
  onUpdateGuestName: (name: string) => void;
  onQuickAction: (action: string) => void;
  onGenerateItineraryClick: () => void;
  onSwitchBookingClick: () => void;
}

export const TripOverview: React.FC<TripOverviewProps> = ({
  tripContext,
  guestName,
  onUpdateGuestName,
  onQuickAction,
  onGenerateItineraryClick,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(guestName);

  const hotel = tripContext?.hotel;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGuestName(nameInput.trim());
    setIsEditingName(false);
  };

  return (
    <div className="full-bleed animate-fade-in" style={{
      marginTop: '-80px', // Pull up under the navbar
      marginBottom: '40px',
      position: 'relative',
      height: '80vh',
      minHeight: '600px',
      maxHeight: '900px',
      overflow: 'hidden'
    }}>
      
      {/* Immersive Background Image */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url(https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2000&auto=format&fit=crop)', // High quality beach/resort
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 1
      }} />

      {/* Gradient Overlay for Text Readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, rgba(11, 22, 38, 0.4) 0%, rgba(11, 22, 38, 0.2) 50%, rgba(251, 249, 245, 1) 100%)',
        zIndex: 2
      }} />

      {/* Hero Content Container */}
      <div className="app-container" style={{
        position: 'relative',
        zIndex: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        paddingBottom: '60px'
      }}>
        
        {/* Welcome Header */}
        <div style={{ maxWidth: '800px', marginBottom: '40px' }}>
          {isEditingName ? (
            <form onSubmit={handleSaveName} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name"
                autoFocus
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  color: '#101F35',
                  padding: '12px 20px',
                  borderRadius: '30px',
                  fontSize: '1.2rem',
                  outline: 'none',
                  fontFamily: 'var(--font-serif)'
                }}
              />
              <button type="submit" className="btn-terracotta" style={{ borderRadius: '30px', padding: '0 24px' }}>Save</button>
            </form>
          ) : (
            <h1 className="font-serif" 
                style={{ 
                  fontSize: 'clamp(3rem, 6vw, 5rem)', 
                  fontWeight: 600, 
                  lineHeight: 1.1, 
                  color: '#0B1626', 
                  margin: '0 0 16px 0',
                  textShadow: '0 4px 20px rgba(255,255,255,0.6)'
                }}
                onClick={() => {
                  setNameInput(guestName);
                  setIsEditingName(true);
                }}
                title="Click to edit name"
            >
              {guestName ? `Welcome to Goa, ${guestName}.` : 'Welcome to Goa.'}
            </h1>
          )}
          
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#172D4D', 
            margin: 0, 
            maxWidth: '600px', 
            lineHeight: 1.6,
            fontWeight: 500
          }}>
            Your AI Concierge is ready. Let's make your stay at <strong>{hotel?.name || 'Taj Fort Aguada'}</strong> absolutely unforgettable.
          </p>
        </div>

        {/* Glassmorphic Quick Actions */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2C5282', paddingRight: '12px' }}>
            What can I help you with?
          </span>
          
          <button onClick={onGenerateItineraryClick} className="btn-terracotta" style={{ borderRadius: '30px', fontSize: '0.9rem' }}>
            <Sparkles size={16} /> Auto-Plan My Day
          </button>
          
          <button onClick={() => onQuickAction("What's a good place for dinner near me tonight?")} 
            style={{ ...actionBtnStyle, color: '#D05B3B' }}>
            <Utensils size={15} /> Dinner
          </button>
          
          <button onClick={() => onQuickAction("Suggest a beach close to my stay.")} 
            style={{ ...actionBtnStyle, color: '#2C5282' }}>
            <Waves size={15} /> Beaches
          </button>
          
          <button onClick={() => onQuickAction("What can I do near my hotel?")} 
            style={{ ...actionBtnStyle, color: '#10B981' }}>
            <MapPin size={15} /> Explore Area
          </button>
          
          <button onClick={() => onQuickAction("What are some hidden gems in Goa?")} 
            style={{ ...actionBtnStyle, color: '#8B5CF6' }}>
            <Search size={15} /> Hidden Gems
          </button>
        </div>
        
      </div>
    </div>
  );
};

const actionBtnStyle = {
  background: '#FFFFFF',
  border: '1px solid rgba(255, 255, 255, 0.9)',
  padding: '10px 20px',
  borderRadius: '30px',
  fontSize: '0.9rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  transition: 'transform 0.2s, box-shadow 0.2s'
};
