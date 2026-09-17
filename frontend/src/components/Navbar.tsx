import React, { useState } from 'react';
import { Compass, Bell, MapPin, Bike, CalendarDays, MessageSquareText, Compass as DirectoryIcon, User, Hotel, ChevronDown, Check } from 'lucide-react';
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
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeHotel = bookings.find((b) => b.id === activeHotelId) || tripContext?.hotel || bookings[0];

  return (
    <header style={{
      background: '#0B1626',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      color: '#FFFFFF'
    }}>
      <div className="app-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px',
      }}>
        {/* Brand & Active Hotel Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            onClick={() => setActiveTab('bookings')}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-terracotta-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Compass size={22} color="#FFFFFF" strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: '1.08rem', fontWeight: 700, letterSpacing: '-0.01em', color: '#FFFFFF' }}>
                AI Trip Concierge
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                Post-Booking Travel Platform
              </div>
            </div>
          </div>

          {/* Active Hotel Quick-Switch Badge */}
          {activeHotel && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '5px 10px',
                  color: '#CBD5E1',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Switch Active Hotel Booking"
              >
                <MapPin size={12} color="#E28445" />
                <span style={{ fontWeight: 600, color: '#FFFFFF', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeHotel.name}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#FDBA74' }}>
                  ({activeHotel.region || 'Goa'})
                </span>
                <ChevronDown size={12} color="#94A3B8" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    width: '300px',
                    background: '#101F35',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-elevated)',
                    zIndex: 60,
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ padding: '6px 8px', fontSize: '0.72rem', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 700 }}>
                    Select Active Hotel Stay
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
                        background: b.id === activeHotelId ? 'rgba(208, 91, 59, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                        border: b.id === activeHotelId ? '1px solid var(--color-terracotta-500)' : '1px solid transparent',
                        borderRadius: 'var(--radius-xs)',
                        padding: '8px 10px',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        transition: 'all 0.12s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                          {b.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                          {b.area} • {b.region}
                        </div>
                      </div>
                      {b.id === activeHotelId && <Check size={14} color="#FDBA74" />}
                    </button>
                  ))}

                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', marginTop: '4px', paddingTop: '4px' }}>
                    <button
                      onClick={() => {
                        setActiveTab('bookings');
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: '#FDBA74',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        padding: '6px 8px',
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      View All Booking Details →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Nav Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '4px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <button
            className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Hotel size={15} /> My Bookings
            {bookings.length > 0 && (
              <span style={{
                background: activeTab === 'bookings' ? 'var(--color-ocean-900)' : 'rgba(255, 255, 255, 0.15)',
                color: activeTab === 'bookings' ? '#FFFFFF' : '#CBD5E1',
                fontSize: '0.68rem',
                padding: '1px 6px',
                borderRadius: '10px',
                marginLeft: '3px',
                fontWeight: 700
              }}>
                {bookings.length}
              </span>
            )}
          </button>

          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <CalendarDays size={15} /> Itinerary
          </button>

          <button
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquareText size={15} /> AI Concierge
          </button>

          <button
            className={`tab-button ${activeTab === 'directory' ? 'active' : ''}`}
            onClick={() => setActiveTab('directory')}
          >
            <DirectoryIcon size={15} /> Goa Directory
          </button>

          <button
            className={`tab-button ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
            style={{ position: 'relative' }}
          >
            <Bell size={15} /> Alerts
            {unreadAlertCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '5px',
                right: '6px',
                background: '#EF4444',
                color: '#FFF',
                fontSize: '0.65rem',
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>
                {unreadAlertCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Actions: Guest Name, Transport Guide & Trigger Alert */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {guestName && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '6px 11px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              color: '#FDBA74',
              fontWeight: 600
            }}>
              <User size={13} color="#FDBA74" />
              <span>{guestName}</span>
            </div>
          )}

          <button
            onClick={onOpenTransport}
            className="btn-secondary"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              color: '#E2E8F0',
              fontSize: '0.82rem',
              padding: '7px 13px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <Bike size={14} color="#E28445" /> Transport Guide
          </button>

          <button
            onClick={onSimulateAlert}
            className="btn-terracotta"
            style={{
              fontSize: '0.82rem',
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            Simulate Alert
          </button>
        </div>
      </div>
    </header>
  );
};
