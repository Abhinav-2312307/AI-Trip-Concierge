import React, { useState } from 'react';
import { Sparkles, Utensils, Waves, MapPin, Search, Car, Calculator, CheckSquare } from 'lucide-react';
import type { TripContext } from '../types';
import type { SupportedLanguage } from '../utils/i18n';
import { t } from '../utils/i18n';

interface TripOverviewProps {
  tripContext: TripContext | null;
  guestName: string;
  onUpdateGuestName: (name: string) => void;
  onQuickAction: (action: string) => void;
  onGenerateItineraryClick: () => void;
  onSwitchBookingClick: () => void;
  onOpenTransitEstimator?: () => void;
  onOpenBudget?: () => void;
  onOpenPacking?: () => void;
  lang?: SupportedLanguage;
}

export const TripOverview: React.FC<TripOverviewProps> = ({
  tripContext,
  guestName,
  onUpdateGuestName,
  onQuickAction,
  onGenerateItineraryClick,
  onOpenTransitEstimator,
  onOpenBudget,
  onOpenPacking,
  lang = 'en',
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
      marginBottom: '32px',
      position: 'relative',
      height: '75vh',
      minHeight: '560px',
      maxHeight: '850px',
      overflow: 'hidden'
    }}>
      
      {/* Immersive Background Image */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url(https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2000&auto=format&fit=crop)',
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
        background: 'linear-gradient(to bottom, rgba(11, 22, 38, 0.45) 0%, rgba(11, 22, 38, 0.25) 50%, var(--bg-primary) 100%)',
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
        paddingBottom: '40px'
      }}>
        
        {/* Welcome Header */}
        <div style={{ maxWidth: '820px', marginBottom: '28px' }}>
          {isEditingName ? (
            <form onSubmit={handleSaveName} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name"
                autoFocus
                style={{
                  background: 'var(--bg-card)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
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
                  fontSize: 'clamp(2.6rem, 5.5vw, 4.5rem)', 
                  fontWeight: 600, 
                  lineHeight: 1.1, 
                  color: 'var(--text-primary)', 
                  margin: '0 0 14px 0',
                  textShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}
                onClick={() => {
                  setNameInput(guestName);
                  setIsEditingName(true);
                }}
                title="Click to edit name"
            >
              {guestName ? `${t('welcomeToGoa', lang)}, ${guestName}.` : `${t('welcomeToGoa', lang)}.`}
            </h1>
          )}
          
          <p style={{ 
            fontSize: '1.15rem', 
            color: 'var(--text-secondary)', 
            margin: 0, 
            maxWidth: '650px', 
            lineHeight: 1.6,
            fontWeight: 500
          }}>
            {t('conciergeSubtitle', lang)} Current Stay: <strong>{hotel?.name || 'Taj Fort Aguada'}</strong> ({hotel?.area || 'Sinquerim'}).
          </p>
        </div>

        {/* Glassmorphic Quick Actions */}
        <div style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', paddingRight: '8px' }}>
              Ask Concierge:
            </span>
            
            <button onClick={onGenerateItineraryClick} className="btn-terracotta" style={{ borderRadius: '30px', fontSize: '0.85rem' }}>
              <Sparkles size={15} /> {t('autoPlanDay', lang)}
            </button>
            
            <button onClick={() => onQuickAction("What's a good place for dinner near me tonight?")} 
              style={{ ...actionBtnStyle, color: 'var(--accent-primary)' }}>
              <Utensils size={14} /> {t('dinnerPrompt', lang)}
            </button>
            
            <button onClick={() => onQuickAction("Suggest a quiet, scenic beach close to my stay.")} 
              style={{ ...actionBtnStyle, color: 'var(--accent-secondary)' }}>
              <Waves size={14} /> {t('beachesPrompt', lang)}
            </button>
            
            <button onClick={() => onQuickAction("What can I do near my hotel?")} 
              style={{ ...actionBtnStyle, color: '#10B981' }}>
              <MapPin size={14} /> {t('explorePrompt', lang)}
            </button>
            
            <button onClick={() => onQuickAction("What are some hidden gems in Goa?")} 
              style={{ ...actionBtnStyle, color: '#8B5CF6' }}>
              <Search size={14} /> {t('hiddenGemsPrompt', lang)}
            </button>
          </div>

          {/* Quick Travel Utilities Row */}
          {(onOpenTransitEstimator || onOpenBudget || onOpenPacking) && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              paddingTop: '8px',
              borderTop: '1px solid var(--border-primary)',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 700, paddingRight: '6px' }}>
                Trip Tools:
              </span>

              {onOpenTransitEstimator && (
                <button onClick={onOpenTransitEstimator} style={utilityBtnStyle}>
                  <Car size={13} color="#F59E0B" /> {t('transitGuide', lang)} & Taxi Rates
                </button>
              )}

              {onOpenBudget && (
                <button onClick={onOpenBudget} style={utilityBtnStyle}>
                  <Calculator size={13} color="#10B981" /> {t('budgetCalculator', lang)}
                </button>
              )}

              {onOpenPacking && (
                <button onClick={onOpenPacking} style={utilityBtnStyle}>
                  <CheckSquare size={13} color="#3B82F6" /> {t('packingList', lang)}
                </button>
              )}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

const actionBtnStyle = {
  background: 'var(--bg-tertiary)',
  border: '1px solid var(--border-primary)',
  padding: '8px 16px',
  borderRadius: '30px',
  fontSize: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  boxShadow: 'var(--shadow-subtle)',
  transition: 'transform 0.2s, box-shadow 0.2s'
};

const utilityBtnStyle = {
  background: 'transparent',
  border: '1px solid var(--border-primary)',
  color: 'var(--text-primary)',
  padding: '5px 12px',
  borderRadius: '20px',
  fontSize: '0.78rem',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  transition: 'all 0.15s ease'
};
