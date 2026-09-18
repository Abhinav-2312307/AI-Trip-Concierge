import React, { useState } from 'react';
import { Compass, Bell, MapPin, Bike, CalendarDays, MessageSquareText, Compass as DirectoryIcon, User, Hotel, ChevronDown, Check, Menu } from 'lucide-react';
import type { TripContext, HotelBooking } from '../types';

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
  onSimulateAlert: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
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
  onSimulateAlert,
  theme,
  toggleTheme,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUtilityMenuOpen, setIsUtilityMenuOpen] = useState(false);

  const activeHotel = bookings.find((b) => b.id === activeHotelId) || tripContext?.hotel || bookings[0];

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
      }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            onClick={() => setActiveTab('overview')}
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
                  background: 'rgba(11, 22, 38, 0.4)',
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
                onMouseOver={e => e.currentTarget.style.background = 'rgba(11, 22, 38, 0.6)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(11, 22, 38, 0.4)'}
              >
                <MapPin size={14} color="#FDBA74" />
                <span style={{ fontWeight: 500, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                    zIndex: 60,
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ padding: '8px 12px', fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700 }}>
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
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{b.area}</div>
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
          gap: '8px',
          background: 'rgba(11, 22, 38, 0.4)',
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
            My Bookings
          </button>

          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            style={navBtnStyle(activeTab === 'overview')}
          >
            Itinerary
          </button>

          <button
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
            style={navBtnStyle(activeTab === 'chat')}
          >
            AI Concierge
          </button>

          <button
            className={`tab-button ${activeTab === 'directory' ? 'active' : ''}`}
            onClick={() => setActiveTab('directory')}
            style={navBtnStyle(activeTab === 'directory')}
          >
            Goa Directory
          </button>
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '10px',
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            style={{
              position: 'relative',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '50%',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            title="Alerts"
          >
            <Bell size={18} />
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

          {/* Hidden Utility Menu for Prototype Testing */}
          <div style={{ position: 'relative' }}>
             <button
               onClick={() => setIsUtilityMenuOpen(!isUtilityMenuOpen)}
               style={{
                 background: 'transparent',
                 border: 'none',
                 color: '#FFFFFF',
                 cursor: 'pointer',
                 padding: '8px',
                 opacity: 0.7,
                 transition: 'opacity 0.2s'
               }}
               onMouseOver={e => e.currentTarget.style.opacity = '1'}
               onMouseOut={e => e.currentTarget.style.opacity = '0.7'}
               title="Dev Tools"
             >
               <Menu size={20} />
             </button>

             {isUtilityMenuOpen && (
               <div style={{
                 position: 'absolute',
                 top: '120%',
                 right: 0,
                 width: '200px',
                 background: 'var(--bg-card)',
                 borderRadius: 'var(--radius-md)',
                 boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                 zIndex: 60,
                 padding: '8px',
                 display: 'flex',
                 flexDirection: 'column',
                 gap: '4px'
               }}>
                 <button onClick={() => { onOpenTransport(); setIsUtilityMenuOpen(false); }}
                   style={menuBtnStyle}>
                   <Bike size={14} /> Transport Guide
                 </button>
                 <button onClick={() => { onSimulateAlert(); setIsUtilityMenuOpen(false); }}
                   style={menuBtnStyle}>
                   <Bell size={14} /> Simulate Alert
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
  padding: '8px 18px',
  fontSize: '0.85rem',
  fontWeight: isActive ? 600 : 500,
  transition: 'all 0.2s ease'
});

const menuBtnStyle = {
  background: 'transparent',
  border: 'none',
  padding: '10px',
  textAlign: 'left' as const,
  fontSize: '0.85rem',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  borderRadius: 'var(--radius-sm)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};
