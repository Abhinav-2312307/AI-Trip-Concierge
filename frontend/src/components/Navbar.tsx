import React, { useState } from 'react';
import { Compass, Bell, MapPin, Bike, ChevronDown, Check, Menu, Map as MapIcon, Calculator, CheckSquare, Car } from 'lucide-react';
import type { TripContext, HotelBooking } from '../types';
import type { SupportedLanguage } from '../utils/i18n';
import { LANGUAGE_OPTIONS, t } from '../utils/i18n';

interface NavbarProps {
  tripContext: TripContext | null;
  guestName: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadAlertCount: number;
  bookings: HotelBooking[];
  activeHotelId: string;
  onSwitchHotel: (hotelId: string) => void;
  onOpenTransport: () => void;
  onOpenTransitEstimator: () => void;
  onOpenBudget: () => void;
  onOpenPacking: () => void;
  onSimulateAlert: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  lang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  tripContext,
  guestName,
  activeTab,
  setActiveTab,
  unreadAlertCount,
  bookings,
  activeHotelId,
  onSwitchHotel,
  onOpenTransport,
  onOpenTransitEstimator,
  onOpenBudget,
  onOpenPacking,
  onSimulateAlert,
  theme,
  toggleTheme,
  lang,
  onLanguageChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isUtilityMenuOpen, setIsUtilityMenuOpen] = useState(false);

  const activeHotel = bookings.find((b) => b.id === activeHotelId) || tripContext?.hotel || bookings[0];
  const currentLangOption = LANGUAGE_OPTIONS.find(l => l.code === lang) || LANGUAGE_OPTIONS[0];

  return (
    <header style={{
      position: 'relative',
      top: 0,
      width: '100%',
      zIndex: 50,
      padding: '20px 0',
      background: 'transparent'
    }}>
      <div className="app-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        
        {/* Brand & Active Hotel Quick-Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            onClick={() => setActiveTab('overview')}
            title="Go to Itinerary Overview"
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <Compass size={22} color="#FFFFFF" strokeWidth={1.5} />
            </div>
          </div>

          {/* Active Hotel Quick-Switch */}
          {activeHotel && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  background: 'rgba(11, 22, 38, 0.45)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '30px',
                  padding: '6px 14px',
                  color: '#FFFFFF',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(11, 22, 38, 0.65)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(11, 22, 38, 0.45)'}
              >
                <MapPin size={14} color="#FDBA74" />
                <span style={{ fontWeight: 500, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeHotel.name}
                </span>
                <ChevronDown size={14} color="#CBD5E1" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '120%',
                    left: 0,
                    width: '280px',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                    zIndex: 60,
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    border: '1px solid var(--border-primary)'
                  }}
                >
                  <div style={{ padding: '8px 12px', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>
                    Select Stay
                  </div>

                  {bookings.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                         onSwitchHotel(b.id);
                         setIsDropdownOpen(false);
                      }}
                      style={{
                        textAlign: 'left',
                        background: b.id === activeHotelId ? 'var(--bg-tertiary)' : 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 12px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={e => { if(b.id !== activeHotelId) e.currentTarget.style.background = 'var(--bg-tertiary)' }}
                      onMouseOut={e => { if(b.id !== activeHotelId) e.currentTarget.style.background = 'transparent' }}
                    >
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{b.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.area}</div>
                      </div>
                      {b.id === activeHotelId && <Check size={16} color="#D05B3B" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Nav Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(11, 22, 38, 0.45)',
          backdropFilter: 'blur(10px)',
          padding: '6px',
          borderRadius: '30px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <button
            className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
            style={navBtnStyle(activeTab === 'bookings')}
          >
            {t('bookings', lang)}
          </button>

          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            style={navBtnStyle(activeTab === 'overview')}
          >
            {t('itinerary', lang)}
          </button>

          <button
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
            style={navBtnStyle(activeTab === 'chat')}
          >
            {t('chat', lang)}
          </button>

          <button
            className={`tab-button ${activeTab === 'directory' ? 'active' : ''}`}
            onClick={() => setActiveTab('directory')}
            style={navBtnStyle(activeTab === 'directory')}
          >
            {t('directory', lang)}
          </button>

          <button
            className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
            style={navBtnStyle(activeTab === 'map')}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <MapIcon size={13} /> {t('map', lang)}
            </span>
          </button>
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {guestName && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.12)',
              padding: '5px 12px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.78rem',
              color: '#FFFFFF',
              fontWeight: 600
            }}>
              <span>👤 {guestName}</span>
            </div>
          )}

          {/* Language Selector Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '7px 12px',
                borderRadius: '30px',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
              title="Change Language"
            >
              <span>{currentLangOption.flag}</span>
              <span>{currentLangOption.code.toUpperCase()}</span>
              <ChevronDown size={12} color="#CBD5E1" />
            </button>

            {isLanguageOpen && (
              <div style={{
                position: 'absolute',
                top: '125%',
                right: 0,
                width: '170px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
                zIndex: 70,
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                border: '1px solid var(--border-primary)'
              }}>
                <div style={{ padding: '6px 8px', fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Language / भाषा
                </div>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => {
                      onLanguageChange(opt.code);
                      setIsLanguageOpen(false);
                    }}
                    style={{
                      background: opt.code === lang ? 'var(--bg-tertiary)' : 'transparent',
                      border: 'none',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{opt.flag}</span>
                      <span>{opt.nativeLabel}</span>
                    </span>
                    {opt.code === lang && <Check size={14} color="#E07A5F" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '9px',
              borderRadius: '50%',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
          </button>

          {/* Coastal Alerts Button */}
          <button
            onClick={() => setActiveTab('alerts')}
            style={{
              position: 'relative',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '9px',
              borderRadius: '50%',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            title={t('alerts', lang)}
          >
            <Bell size={17} />
            {unreadAlertCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: '#F87171',
                color: '#FFF',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: '2px solid #FFFFFF'
              }}>
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* Luxury Concierge Tools Menu */}
          <div style={{ position: 'relative' }}>
             <button
               onClick={() => setIsUtilityMenuOpen(!isUtilityMenuOpen)}
               style={{
                 background: 'rgba(255,255,255,0.15)',
                 backdropFilter: 'blur(10px)',
                 border: '1px solid rgba(255,255,255,0.3)',
                 color: '#FFFFFF',
                 cursor: 'pointer',
                 padding: '9px',
                 borderRadius: '50%',
                 transition: 'all 0.2s',
                 boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}
               title="Concierge Luxury Tools"
             >
               <Menu size={17} />
             </button>

             {isUtilityMenuOpen && (
               <div style={{
                 position: 'absolute',
                 top: '125%',
                 right: 0,
                 width: '230px',
                 background: 'var(--bg-card)',
                 borderRadius: 'var(--radius-md)',
                 boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                 zIndex: 70,
                 padding: '8px',
                 display: 'flex',
                 flexDirection: 'column',
                 gap: '4px',
                 border: '1px solid var(--border-primary)'
               }}>
                 <div style={{ padding: '6px 10px', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>
                   Guest Services & Tools
                 </div>
                 
                 <button onClick={() => { onOpenTransitEstimator(); setIsUtilityMenuOpen(false); }}
                   style={menuBtnStyle}>
                   <Car size={15} color="#F59E0B" />
                   <div>
                     <div style={{ fontWeight: 600 }}>{t('transitGuide', lang)} / Taxi</div>
                     <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>GoaMiles & private rates</div>
                   </div>
                 </button>

                 <button onClick={() => { onOpenBudget(); setIsUtilityMenuOpen(false); }}
                   style={menuBtnStyle}>
                   <Calculator size={15} color="#10B981" />
                   <div>
                     <div style={{ fontWeight: 600 }}>{t('budgetCalculator', lang)}</div>
                     <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Multi-currency & split bill</div>
                   </div>
                 </button>

                 <button onClick={() => { onOpenPacking(); setIsUtilityMenuOpen(false); }}
                   style={menuBtnStyle}>
                   <CheckSquare size={15} color="#3B82F6" />
                   <div>
                     <div style={{ fontWeight: 600 }}>{t('packingList', lang)}</div>
                     <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Tropical checklist with progress</div>
                   </div>
                 </button>

                 <button onClick={() => { onOpenTransport(); setIsUtilityMenuOpen(false); }}
                   style={menuBtnStyle}>
                   <Bike size={15} color="#8B5CF6" />
                   <div>
                     <div style={{ fontWeight: 600 }}>Scooter & Pilot Guide</div>
                     <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Rules, pricing & rentals</div>
                   </div>
                 </button>

                 <div style={{ height: '1px', background: 'var(--border-primary)', margin: '4px 0' }} />

                 <button onClick={() => { onSimulateAlert(); setIsUtilityMenuOpen(false); }}
                   style={{ ...menuBtnStyle, opacity: 0.85 }}>
                   <Bell size={15} color="#E07A5F" />
                   <div>
                     <div style={{ fontWeight: 600 }}>Simulate Live Alert</div>
                     <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Test instant push advice</div>
                   </div>
                 </button>
               </div>
             )}
          </div>
        </div>

      </div>
    </header>
  );
};

const navBtnStyle = (isActive: boolean) => ({
  color: isActive ? '#0B1626' : '#FFFFFF',
  background: isActive ? '#FFFFFF' : 'transparent',
  borderRadius: '24px',
  padding: '7px 16px',
  fontSize: '0.82rem',
  fontWeight: isActive ? 700 : 500,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: 'none',
  display: 'inline-flex',
  alignItems: 'center'
});

const menuBtnStyle = {
  background: 'transparent',
  border: 'none',
  padding: '8px 10px',
  textAlign: 'left' as const,
  fontSize: '0.82rem',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  borderRadius: 'var(--radius-sm)',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  transition: 'background 0.15s ease'
};
