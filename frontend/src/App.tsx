import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { TripOverview } from './components/TripOverview';
import { ItineraryView } from './components/ItineraryView';
import { AIChat } from './components/AIChat';
import { RecommendationsView } from './components/RecommendationsView';
import { AlertsHub } from './components/AlertsHub';
import { TransportModal } from './components/TransportModal';
import { BookingsView } from './components/BookingsView';
import { BookingDetailModal } from './components/BookingDetailModal';
import type {
  TripContext,
  ItineraryResponse,
  ChatMessage,
  SmartAlert,
  TransportGuideItem,
  HotelBooking
} from './types';
import {
  fetchBookings,
  fetchTripContext,
  sendChatMessage,
  generateItinerary,
  fetchAlerts,
  simulateAlert,
  fetchTransportGuide
} from './services/api';

export const App: React.FC = () => {
  const [guestName, setGuestName] = useState<string>(() => {
    return localStorage.getItem('concierge_guest_name') || '';
  });
  const [activeHotelId, setActiveHotelId] = useState<string>(() => {
    return localStorage.getItem('concierge_active_hotel_id') || 'taj-fort-aguada';
  });
  const [bookings, setBookings] = useState<HotelBooking[]>([]);
  const [tripContext, setTripContext] = useState<TripContext | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [itineraryData, setItineraryData] = useState<ItineraryResponse | null>(null);
  const [itineraryLoading, setItineraryLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [unreadAlertCount, setUnreadAlertCount] = useState<number>(0);
  const [transportItems, setTransportItems] = useState<TransportGuideItem[]>([]);
  const [isTransportOpen, setIsTransportOpen] = useState<boolean>(false);
  const [toastAlert, setToastAlert] = useState<SmartAlert | null>(null);
  const [selectedBookingForModal, setSelectedBookingForModal] = useState<HotelBooking | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('concierge_theme') as 'light' | 'dark') || 'light';
  });

  const activeHotel = bookings.find(b => b.id === activeHotelId) || tripContext?.hotel || bookings[0] || null;

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('concierge_theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const getWelcomeGreeting = (name: string, hotel?: HotelBooking | null) => {
    const greeting = name.trim() ? `Namaste ${name.trim()}!` : 'Namaste!';
    const hName = hotel?.name || 'Taj Fort Aguada Resort & Spa, Goa';
    const hArea = hotel?.area || 'Sinquerim, Candolim';
    return `${greeting} Welcome to Goa and **${hName}** (${hArea}).\n\nI am your dedicated hotel AI concierge. Whether you'd like dinner recommendations near your stay, quiet morning beaches, sunset bookings, check-in guidance, or local transport guidance, feel free to ask anytime.\n\nHow may I assist your stay today?`;
  };

  // Initial Load
  useEffect(() => {
    const initData = async () => {
      try {
        const [bookingsRes, contextRes, alertsRes, transportRes] = await Promise.all([
          fetchBookings().catch(() => ({ count: 0, hotels: [] })),
          fetchTripContext(activeHotelId).catch(() => null),
          fetchAlerts(activeHotelId).catch(() => ({ alerts: [] })),
          fetchTransportGuide(activeHotelId).catch(() => ({ guide: [] })),
        ]);

        if (bookingsRes.hotels && bookingsRes.hotels.length > 0) {
          setBookings(bookingsRes.hotels);
        }

        if (contextRes) {
          setTripContext(contextRes);
          if (contextRes.guest_name && !guestName) {
            setGuestName(contextRes.guest_name);
          }
        }

        if (alertsRes.alerts) {
          setAlerts(alertsRes.alerts);
          setUnreadAlertCount(alertsRes.alerts.length);
        }

        if (transportRes.guide) {
          setTransportItems(transportRes.guide);
        }

        const currentSavedName = localStorage.getItem('concierge_guest_name') || '';
        const initialHotel = bookingsRes.hotels.find(b => b.id === activeHotelId) || contextRes?.hotel;

        // Generate initial 3-day itinerary for active hotel
        loadItinerary(activeHotelId, 3, false, currentSavedName, contextRes?.check_in);

        // Seed initial welcome message for active hotel
        setChatMessages([
          {
            id: 'welcome-msg',
            sender: 'assistant',
            text: getWelcomeGreeting(currentSavedName, initialHotel),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            provider: `${initialHotel?.name || 'AI Concierge'} Grounded Engine`
          }
        ]);
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };

    initData();
  }, []);

  const handleUpdateGuestName = (newName: string) => {
    setGuestName(newName);
    localStorage.setItem('concierge_guest_name', newName);

    // Update welcome message if still first turn
    setChatMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome-msg') {
        return [{
          ...prev[0],
          text: getWelcomeGreeting(newName, activeHotel)
        }];
      }
      return prev;
    });

    // Refresh itinerary with new guest name
    loadItinerary(activeHotelId, itineraryData?.total_days || 3, false, newName, tripContext?.check_in);
  };

  const handleSwitchHotel = async (newHotelId: string, switchTabTo?: string) => {
    setActiveHotelId(newHotelId);
    localStorage.setItem('concierge_active_hotel_id', newHotelId);
    
    const selectedHotel = bookings.find(b => b.id === newHotelId) || null;

    try {
      const [contextRes, alertsRes] = await Promise.all([
        fetchTripContext(newHotelId).catch(() => null),
        fetchAlerts(newHotelId).catch(() => ({ alerts: [] })),
      ]);

      if (contextRes) {
        setTripContext(contextRes);
      }
      if (alertsRes.alerts) {
        setAlerts(alertsRes.alerts);
        setUnreadAlertCount(alertsRes.alerts.length);
      }

      // Refresh itinerary for new hotel
      await loadItinerary(newHotelId, itineraryData?.total_days || 3, false, guestName, contextRes?.check_in);

      // Update welcome message for new hotel
      setChatMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: 'assistant',
          text: getWelcomeGreeting(guestName, selectedHotel || contextRes?.hotel),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          provider: `${selectedHotel?.name || 'AI Concierge'} Grounded Engine`
        }
      ]);

      if (switchTabTo) {
        setActiveTab(switchTabTo);
      }
    } catch (err) {
      console.error('Error switching hotel:', err);
    }
  };

  const loadItinerary = async (
    hotelId: string = activeHotelId,
    days: number = 3,
    triggerConfetti: boolean = true,
    nameParam?: string,
    startDate?: string
  ) => {
    setItineraryLoading(true);
    try {
      const activeName = nameParam !== undefined ? nameParam : guestName;
      const start = startDate || tripContext?.check_in;
      const data = await generateItinerary(hotelId, days, 'balanced', activeName, start);
      setItineraryData(data);
      if (triggerConfetti) {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#D05B3B', '#E28445', '#265943', '#172D4D']
        });
      }
    } catch (err) {
      console.error('Failed to generate itinerary', err);
    } finally {
      setItineraryLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsgId = `user-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...chatMessages, newMsg];
    setChatMessages(updatedHistory);
    setChatLoading(true);

    if (activeTab !== 'chat') {
      setActiveTab('chat');
    }

    try {
      const historyPayload = updatedHistory.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await sendChatMessage(text, historyPayload, guestName, activeHotelId);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tool_calls: res.tool_calls,
        cards: res.cards,
        provider: res.provider,
        hotel_origin: res.hotel_origin
      };

      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        sender: 'assistant',
        text: `I encountered an issue connecting to the concierge service: ${err.message || 'Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSimulateAlert = async (type: string = 'rain_baga') => {
    try {
      const res = await simulateAlert(activeHotelId, type);
      const simulated = res.alert;

      setAlerts(prev => [simulated, ...prev.filter(a => a.id !== simulated.id)]);
      setUnreadAlertCount(prev => prev + 1);

      setToastAlert(simulated);
      setTimeout(() => setToastAlert(null), 6000);

      const alertChatMsg: ChatMessage = {
        id: `alert-msg-${Date.now()}`,
        sender: 'assistant',
        text: `**Notification: ${simulated.title}**\n\n${simulated.message}\n\n💡 *Concierge Recommendation*: ${simulated.recommended_action}`,
        timestamp: simulated.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: `${activeHotel?.name || 'Hotel'} Notification Service`,
        isAlert: true
      };

      setChatMessages(prev => [...prev, alertChatMsg]);
    } catch (err) {
      console.error('Failed to simulate alert', err);
    }
  };

  const handleClearChat = () => {
    setChatMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: getWelcomeGreeting(guestName, activeHotel),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: `${activeHotel?.name || 'AI Concierge'} Grounded Engine`
      }
    ]);
  };

  const handleAskConciergeAboutPlace = (placeName: string) => {
    setActiveTab('chat');
    handleSendMessage(`Tell me more about visiting ${placeName} from ${activeHotel?.name || 'my hotel'}, and what is the best time and must-try experience?`);
  };

  const handleAlertAction = (alert: SmartAlert) => {
    setActiveTab('chat');
    handleSendMessage(`Regarding the alert "${alert.title}", what should I do next? ${alert.recommended_action}`);
  };

  const handleOpenBookingModal = (hotel: HotelBooking) => {
    setSelectedBookingForModal(hotel);
    setIsBookingModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Header */}
      <Navbar
        tripContext={tripContext}
        guestName={guestName}
        activeTab={activeTab}
        setActiveTab={(t) => {
          setActiveTab(t);
          if (t === 'alerts') setUnreadAlertCount(0);
        }}
        unreadAlertCount={unreadAlertCount}
        bookings={bookings}
        activeHotelId={activeHotelId}
        onSwitchHotel={(id) => handleSwitchHotel(id)}
        onOpenTransport={() => setIsTransportOpen(true)}
        onSimulateAlert={() => handleSimulateAlert('rain_baga')}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Body */}
      <main style={{ flex: 1, padding: '24px 0 48px' }}>
        <div className="app-container">
          {/* Top Hero Booking Overview Banner */}
          <TripOverview
            tripContext={tripContext}
            guestName={guestName}
            onUpdateGuestName={handleUpdateGuestName}
            onQuickAction={handleSendMessage}
            onGenerateItineraryClick={() => {
              setActiveTab('overview');
              loadItinerary(activeHotelId, 3, true);
            }}
            onSwitchBookingClick={() => setActiveTab('bookings')}
          />

          {/* Active View Switching */}
          {activeTab === 'bookings' && (
            <BookingsView
              bookings={bookings}
              activeHotelId={activeHotelId}
              guestName={guestName}
              onSelectBooking={(id) => handleSwitchHotel(id, 'overview')}
              onOpenConcierge={(id) => handleSwitchHotel(id, 'chat')}
              onPlanTrip={(id) => handleSwitchHotel(id, 'overview')}
              onViewDetails={handleOpenBookingModal}
            />
          )}

          {activeTab === 'overview' && (
            <ItineraryView
              itineraryData={itineraryData}
              loading={itineraryLoading}
              activeHotel={activeHotel}
              onGenerate={(days) => loadItinerary(activeHotelId, days, true)}
              onAskConciergeAboutPlace={handleAskConciergeAboutPlace}
            />
          )}

          {activeTab === 'chat' && (
            <AIChat
              messages={chatMessages}
              loading={chatLoading}
              activeHotel={activeHotel}
              guestName={guestName}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              onViewPlaceDetails={(place) => handleAskConciergeAboutPlace(place.name)}
            />
          )}

          {activeTab === 'directory' && (
            <RecommendationsView
              activeHotel={activeHotel}
              onAskConcierge={handleAskConciergeAboutPlace}
              onSelectPlace={(place) => handleAskConciergeAboutPlace(place.name)}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsHub
              alerts={alerts}
              activeHotel={activeHotel}
              guestName={guestName}
              onSimulate={handleSimulateAlert}
              onAlertAction={handleAlertAction}
              onDismissAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))}
            />
          )}
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toastAlert && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 90,
            maxWidth: '380px',
            background: '#101F35',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-sm)',
            padding: '16px 18px',
            boxShadow: 'var(--shadow-elevated)',
            border: '1px solid rgba(226, 132, 69, 0.4)',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            cursor: 'pointer',
          }}
          className="animate-fade-in"
          onClick={() => {
            setActiveTab('alerts');
            setToastAlert(null);
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>{toastAlert.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FDBA74' }}>
              {toastAlert.title}
            </div>
            <p style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '3px', lineHeight: 1.4, margin: 0 }}>
              {toastAlert.message}
            </p>
            <div style={{ marginTop: '6px', fontSize: '0.76rem', color: '#A7F3D0', fontWeight: 600 }}>
              View alert details & concierge advice →
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      <BookingDetailModal
        hotel={selectedBookingForModal}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        isActive={selectedBookingForModal?.id === activeHotelId}
        guestName={guestName}
        onSelectAndOpenConcierge={(id) => handleSwitchHotel(id, 'chat')}
        onSelectAndPlanItinerary={(id) => handleSwitchHotel(id, 'overview')}
      />

      {/* Transport Guide Modal */}
      <TransportModal
        isOpen={isTransportOpen}
        onClose={() => setIsTransportOpen(false)}
        guideItems={transportItems}
      />

      {/* Footer */}
      <footer style={{
        background: '#0B1626',
        color: '#94A3B8',
        padding: '24px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '0.84rem'
      }}>
        <div className="app-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong style={{ color: '#FFFFFF' }}>AI Trip Concierge</strong> • {activeHotel?.name || 'Taj Fort Aguada Resort & Spa, Goa'}
          </div>
          <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem' }}>
            <span>{activeHotel?.area || 'Sinquerim, Candolim'}, {activeHotel?.region || 'North Goa'}</span>
            <span>•</span>
            <span style={{ color: '#E28445' }}>24/7 Hotel Guest Assistant</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
