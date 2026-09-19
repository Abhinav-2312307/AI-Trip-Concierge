import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, 
  ChevronDown, 
  Sparkles, 
  Bell, 
  Menu, 
  X, 
  Bookmark, 
  LogOut, 
  Zap, 
  Calendar,
  Building
} from 'lucide-react';
import type { TripContext, HotelBooking, User, Booking } from '../types';
import type { SupportedLanguage } from '../utils/i18n';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  currentUser: User | null;
  currentBooking: Booking | null;
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  onJudgeDemo: () => void;
  tripContext: TripContext | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadAlertCount: number;
  bookings: HotelBooking[];
  activeHotelId: string;
  onSwitchHotel: (hotelId: string) => void;
  lang?: SupportedLanguage;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  currentUser,
  currentBooking,
  onOpenAuthModal,
  onLogout,
  onJudgeDemo,
  tripContext,
  activeTab,
  setActiveTab,
  unreadAlertCount,
  bookings,
  activeHotelId,
  onSwitchHotel,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasActiveBooking = !!currentBooking;
  const isDashboard = currentView === 'dashboard';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const guestDisplayName = currentUser?.name || currentBooking?.guestName || 'Aditya';
  const userInitial = guestDisplayName.charAt(0).toUpperCase() || 'A';

  const handleNavClick = (view: string, tab?: string) => {
    setCurrentView(view);
    if (tab) setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      width: '100%',
      height: '74px',
      zIndex: 100,
      background: isScrolled
        ? 'rgba(11, 22, 38, 0.92)'
        : 'rgba(11, 22, 38, 0.55)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: isScrolled ? '0 10px 30px rgba(0, 0, 0, 0.35)' : 'none',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        height: '100%',
        padding: '0 clamp(16px, 3.5vw, 48px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px'
      }}>
        
        {/* ── LEFT: Modern Sunset Brand Logo ── */}
        <div
          onClick={() => handleNavClick(hasActiveBooking ? 'dashboard' : 'landing', 'overview')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          title="AI Trip Concierge"
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '11px',
            background: 'linear-gradient(135deg, #FF6B4A 0%, #E28445 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(255, 107, 74, 0.45)',
            flexShrink: 0
          }}>
            <Compass size={22} color="#FFFFFF" strokeWidth={2.4} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.15rem',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-sans)',
            }}>
              AI Trip Concierge
            </span>
            <span style={{
              color: '#FDBA74',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              Goa Traveller OS
            </span>
          </div>
        </div>

        {/* ── CENTER: Clean Modern Navigation Links ── */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(12px, 2vw, 28px)'
        }} className="desktop-nav-center">
          
          {/* 1. Home */}
          <button
            onClick={() => handleNavClick('landing')}
            style={{
              background: currentView === 'landing' ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
              border: 'none',
              borderRadius: '9999px',
              padding: '7px 16px',
              color: currentView === 'landing' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
              fontSize: '0.92rem',
              fontWeight: currentView === 'landing' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (currentView !== 'landing') e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              if (currentView !== 'landing') e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
            }}
          >
            Home
          </button>

          {/* 2. My Trips — ONLY AFTER SIGN IN */}
          {(currentUser || hasActiveBooking) && (
            <button
              onClick={() => handleNavClick('dashboard', 'bookings')}
              style={{
                background: isDashboard && activeTab === 'bookings' ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                border: 'none',
                borderRadius: '9999px',
                padding: '7px 16px',
                color: isDashboard && activeTab === 'bookings' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                fontSize: '0.92rem',
                fontWeight: isDashboard && activeTab === 'bookings' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!(isDashboard && activeTab === 'bookings')) e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                if (!(isDashboard && activeTab === 'bookings')) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
              }}
            >
              My Trips
            </button>
          )}

          {/* 3. Explore Goa */}
          <button
            onClick={() => handleNavClick('explore')}
            style={{
              background: (currentView === 'explore' || currentView === 'hotel-details') ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
              border: 'none',
              borderRadius: '9999px',
              padding: '7px 16px',
              color: (currentView === 'explore' || currentView === 'hotel-details') ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
              fontSize: '0.92rem',
              fontWeight: (currentView === 'explore' || currentView === 'hotel-details') ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (currentView !== 'explore' && currentView !== 'hotel-details') e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              if (currentView !== 'explore' && currentView !== 'hotel-details') e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
            }}
          >
            Explore Goa
          </button>

          {/* 4. Experiences */}
          <button
            onClick={() => {
              if (hasActiveBooking || currentUser) {
                handleNavClick('dashboard', 'directory');
              } else {
                onOpenAuthModal('login');
              }
            }}
            style={{
              background: isDashboard && activeTab === 'directory' ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
              border: 'none',
              borderRadius: '9999px',
              padding: '7px 16px',
              color: isDashboard && activeTab === 'directory' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
              fontSize: '0.92rem',
              fontWeight: isDashboard && activeTab === 'directory' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!(isDashboard && activeTab === 'directory')) e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              if (!(isDashboard && activeTab === 'directory')) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
            }}
          >
            Experiences
          </button>

          {/* 5. Travel Guides */}
          <button
            onClick={() => {
              if (hasActiveBooking || currentUser) {
                handleNavClick('dashboard', 'map');
              } else {
                onOpenAuthModal('login');
              }
            }}
            style={{
              background: isDashboard && activeTab === 'map' ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
              border: 'none',
              borderRadius: '9999px',
              padding: '7px 16px',
              color: isDashboard && activeTab === 'map' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
              fontSize: '0.92rem',
              fontWeight: isDashboard && activeTab === 'map' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!(isDashboard && activeTab === 'map')) e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              if (!(isDashboard && activeTab === 'map')) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
            }}
          >
            Travel Guides
          </button>

        </nav>

        {/* ── RIGHT: Glowing Pill CTA + Notification + User Avatar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} ref={menuRef}>
          
          {/* Glowing Dark Pill Ask AI Concierge Button */}
          <button
            onClick={() => {
              if (hasActiveBooking || currentUser) {
                handleNavClick('dashboard', 'chat');
              } else {
                onOpenAuthModal('login');
              }
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              borderRadius: '9999px',
              padding: '8px 18px',
              color: '#FFFFFF',
              fontSize: '0.86rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(255, 107, 74, 0.15)',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)';
              e.currentTarget.style.borderColor = 'rgba(255, 107, 74, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
            }}
          >
            <Sparkles size={14} color="#FF9A76" />
            <span>Ask AI Concierge</span>
          </button>

          {/* Notification Bell with Badge (only when signed in) */}
          {(currentUser || hasActiveBooking) && (
            <button
              onClick={() => handleNavClick('dashboard', 'alerts')}
              style={{
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title={unreadAlertCount > 0 ? `${unreadAlertCount} new notifications` : 'Notifications'}
            >
              <Bell size={15} />
              {unreadAlertCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  background: '#FF6B4A',
                  color: '#FFFFFF',
                  fontSize: '9px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #0B1626'
                }}>
                  {unreadAlertCount}
                </span>
              )}
            </button>
          )}

          {/* Signed In: Profile Pill with Dropdown | Signed Out: Sign In Button */}
          {currentUser || hasActiveBooking ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: '9999px',
                  padding: '4px 12px 4px 4px',
                  color: '#FFFFFF',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF6B4A 0%, #E28445 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 800
                }}>
                  {userInitial}
                </div>

                <span>{guestDisplayName.split(' ')[0]}</span>
                <ChevronDown size={13} color="#CBD5E1" />
              </button>

              {/* Floating Luxury Profile Dropdown */}
              {isProfileMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: 0,
                  width: '250px',
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: '0 20px 48px rgba(0, 0, 0, 0.25)',
                  padding: '10px',
                  zIndex: 150,
                  animation: 'fadeIn 0.18s ease'
                }}>
                  <div style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #F1ECE4',
                    marginBottom: '8px'
                  }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0B1626' }}>
                      {guestDisplayName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                      {currentBooking?.hotelName || tripContext?.hotel?.name || 'Taj Fort Aguada Guest'}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleNavClick('dashboard', 'overview');
                      setIsProfileMenuOpen(false);
                    }}
                    style={dropdownItemStyle}
                  >
                    <Calendar size={15} color="#FF6B4A" />
                    <span>My Trip Journal</span>
                  </button>

                  <button
                    onClick={() => {
                      handleNavClick('dashboard', 'bookings');
                      setIsProfileMenuOpen(false);
                    }}
                    style={dropdownItemStyle}
                  >
                    <Bookmark size={15} color="#238C87" />
                    <span>My Bookings</span>
                  </button>

                  <button
                    onClick={() => {
                      handleNavClick('dashboard', 'alerts');
                      setIsProfileMenuOpen(false);
                    }}
                    style={dropdownItemStyle}
                  >
                    <Bell size={15} color="#C9A45C" />
                    <span>Trip Notifications</span>
                  </button>

                  {/* Switch Active Hotel Stay */}
                  {bookings.length > 0 && (
                    <div style={{
                      padding: '8px 12px 4px',
                      borderTop: '1px solid #F1ECE4',
                      marginTop: '6px'
                    }}>
                      <div style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: '#94A3B8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: '6px'
                      }}>
                        Switch Resort Hub
                      </div>
                      {bookings.map(h => (
                        <button
                          key={h.id}
                          onClick={() => {
                            onSwitchHotel(h.id);
                            setIsProfileMenuOpen(false);
                          }}
                          style={{
                            ...dropdownItemStyle,
                            padding: '6px 8px',
                            fontSize: '0.8rem',
                            background: activeHotelId === h.id ? '#FFF5F0' : 'transparent',
                            color: activeHotelId === h.id ? '#FF6B4A' : '#475569',
                            fontWeight: activeHotelId === h.id ? 700 : 500
                          }}
                        >
                          <Building size={13} color={activeHotelId === h.id ? '#FF6B4A' : '#94A3B8'} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name.split(',')[0]}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid #F1ECE4', margin: '6px 0' }} />

                  {/* Seed Demo Quick Trigger */}
                  <button
                    onClick={() => {
                      onJudgeDemo();
                      setIsProfileMenuOpen(false);
                    }}
                    style={{
                      ...dropdownItemStyle,
                      color: '#FF6B4A'
                    }}
                  >
                    <Zap size={15} color="#FF6B4A" />
                    <span>⚡ Seed Demo Trip</span>
                  </button>

                  <button
                    onClick={() => {
                      onLogout();
                      setIsProfileMenuOpen(false);
                    }}
                    style={{
                      ...dropdownItemStyle,
                      color: '#EF4444'
                    }}
                  >
                    <LogOut size={15} color="#EF4444" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAuthModal('login')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9999px',
                padding: '8px 20px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(255, 107, 74, 0.35)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(255, 107, 74, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 107, 74, 0.35)';
              }}
            >
              <span>Sign In</span>
            </button>
          )}
          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-nav-toggle"
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'none',
              padding: '6px'
            }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>

      </div>

      {/* ── MOBILE DRAWER ── */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '74px',
          left: 0,
          width: '100vw',
          height: 'calc(100vh - 74px)',
          background: '#0B1626',
          color: '#FFFFFF',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 200,
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              fontSize: '0.76rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#FF6B4A',
              fontWeight: 800
            }}>
              NAVIGATION
            </div>

            {[
              { label: 'Home', view: 'landing' },
              { label: 'Plan Trip (Journal)', view: 'dashboard', tab: 'overview' },
              { label: 'Explore Stays', view: 'explore' },
              { label: 'Experiences & Dining', view: 'dashboard', tab: 'directory' },
              { label: 'Travel Guides & Map', view: 'dashboard', tab: 'map' },
              { label: 'AI Concierge', view: 'dashboard', tab: 'chat' },
              { label: 'Trip Alerts', view: 'dashboard', tab: 'alerts' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => handleNavClick(item.view, item.tab)}
                style={{
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  color: '#FFFFFF',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '20px' }}>
            <button
              onClick={() => {
                onJudgeDemo();
                setIsMobileMenuOpen(false);
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #FF6B4A 0%, #E28445 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '13px',
                borderRadius: '8px',
                fontSize: '0.94rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Zap size={16} /> ⚡ Seed Demo Trip
            </button>

            {currentUser && (
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: '#EF4444',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}

      {/* Responsive Breakpoints CSS */}
      <style>{`
        @media (max-width: 900px) {
          .desktop-nav-center {
            display: none !important;
          }
          .mobile-nav-toggle {
            display: block !important;
          }
        }
      `}</style>

    </header>
  );
};

const dropdownItemStyle: React.CSSProperties = {
  width: '100%',
  background: 'none',
  border: 'none',
  textAlign: 'left',
  padding: '9px 12px',
  borderRadius: '8px',
  fontSize: '0.86rem',
  fontWeight: 600,
  color: '#0B1626',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  transition: 'background 0.15s ease'
};
