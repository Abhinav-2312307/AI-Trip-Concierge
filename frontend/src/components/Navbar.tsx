import React from 'react';
import { Compass, Bell, MapPin, Bike, CalendarDays, MessageSquareText, Compass as DirectoryIcon, User } from 'lucide-react';
import type { TripContext } from '../types';

interface NavbarProps {
  tripContext: TripContext | null;
  guestName: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadAlertCount: number;
  onOpenTransport: () => void;
  onSimulateAlert: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  tripContext,
  guestName,
  activeTab,
  setActiveTab,
  unreadAlertCount,
  onOpenTransport,
  onSimulateAlert,
}) => {
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
        {/* Brand & Identity */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          onClick={() => setActiveTab('overview')}
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
            <div style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em', color: '#FFFFFF' }}>
              AI Trip Concierge
            </div>
            <div style={{ fontSize: '0.76rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={11} color="#E28445" /> {tripContext?.hotel?.name || 'Taj Fort Aguada Resort & Spa'} • Sinquerim, Goa
            </div>
          </div>
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
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <CalendarDays size={15} /> Itinerary
          </button>
          <button
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquareText size={15} /> Concierge Chat
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

        {/* Right Actions: Transport Guide & Trigger Alert */}
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
