import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { HotelDiscovery } from './components/HotelDiscovery';
import { HotelDetails } from './components/HotelDetails';
import { CheckoutModal } from './components/CheckoutModal';
import { BookingConfirmation } from './components/BookingConfirmation';
import { MyTripJourney } from './components/MyTripJourney';
import { AIChat } from './components/AIChat';
import { RecommendationsView } from './components/RecommendationsView';
import { AlertsHub } from './components/AlertsHub';
import { TransportModal } from './components/TransportModal';
import { BookingsView } from './components/BookingsView';
import { BookingDetailModal } from './components/BookingDetailModal';
import { TransitEstimatorModal } from './components/TransitEstimatorModal';
import { TripBudgetModal } from './components/TripBudgetModal';
import { PackingChecklistModal } from './components/PackingChecklistModal';
import { MapView } from './components/MapView';
import type { SupportedLanguage } from './utils/i18n';
import { t, getLanguageInstruction } from './utils/i18n';
import type {
  TripContext,
  ItineraryResponse,
  ChatMessage,
  SmartAlert,
  TransportGuideItem,
  HotelBooking,
  HotelRoom,
  Booking,
  User
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
  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('concierge_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Current Active Booking State
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(() => {
    const saved = localStorage.getItem('concierge_current_booking');
    return saved ? JSON.parse(saved) : null;
  });

  // Top-Level Application View: 'landing' | 'explore' | 'hotel-details' | 'confirmation' | 'dashboard'
  const [currentView, setCurrentView] = useState<string>(() => {
    const savedUser = localStorage.getItem('concierge_user');
    const savedBooking = localStorage.getItem('concierge_current_booking');
    if (savedUser && savedBooking) return 'dashboard';
    if (savedUser) return 'explore';
    return 'landing';
  });

  // Active Hotel context
  const [activeHotelId, setActiveHotelId] = useState<string>(() => {
    return localStorage.getItem('concierge_active_hotel_id') || 'taj-fort-aguada';
  });

  const [lang] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('concierge_lang') as SupportedLanguage) || 'en';
  });
  const [theme] = useState<'light' | 'dark'>('light');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

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

  // Selected Hotel for Detail View
  const [selectedHotelForDetails, setSelectedHotelForDetails] = useState<HotelBooking | null>(null);

  // Selected Booking Configuration for Checkout
  const [checkoutConfig, setCheckoutConfig] = useState<{
    hotel: HotelBooking;
    room: HotelRoom;
    checkIn: string;
    checkInFormatted: string;
    checkOut: string;
    checkOutFormatted: string;
    nights: number;
    guests: number;
    subtotal: number;
    gst: number;
    totalAmount: number;
  } | null>(null);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [isTransportOpen, setIsTransportOpen] = useState<boolean>(false);
  const [isTransitEstimatorOpen, setIsTransitEstimatorOpen] = useState<boolean>(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState<boolean>(false);
  const [isPackingOpen, setIsPackingOpen] = useState<boolean>(false);
  const [toastAlert, setToastAlert] = useState<SmartAlert | null>(null);
  const [selectedBookingForModal, setSelectedBookingForModal] = useState<HotelBooking | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);

  // Live GPS State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [userArea, setUserArea] = useState<string>('Candolim, North Goa');

  const guestName = currentUser?.name || currentBooking?.guestName || localStorage.getItem('concierge_guest_name') || '';

  const activeHotel = bookings.find(b => b.id === activeHotelId) || tripContext?.hotel || bookings[0] || null;

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getWelcomeGreeting = (name: string, hotel?: HotelBooking | null) => {
    const greeting = name.trim() ? `Namaste ${name.trim()}!` : 'Namaste!';
    const hName = hotel?.name || 'Taj Fort Aguada Resort & Spa, Goa';
    const hArea = hotel?.area || 'Sinquerim, Candolim';
    return `${greeting} Welcome to Goa and **${hName}** (${hArea}).\n\nI am your dedicated 24/7 personal hotel AI concierge. Whether you'd like dinner recommendations near your stay, quiet morning beaches, sunset bookings, check-in guidance, or local transport, feel free to ask anytime.\n\nHow may I assist your stay today?`;
  };

  // Initial Data Fetch
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
        }

        if (alertsRes.alerts) {
          setAlerts(alertsRes.alerts);
          setUnreadAlertCount(alertsRes.alerts.length);
        }

        if (transportRes.guide) {
          setTransportItems(transportRes.guide);
        }

        const initialHotel = bookingsRes.hotels.find(b => b.id === activeHotelId) || contextRes?.hotel;

        // Generate initial itinerary
        loadItinerary(activeHotelId, 3, false, guestName, contextRes?.check_in);

        // Seed welcome message
        setChatMessages([
          {
            id: 'welcome-msg',
            sender: 'assistant',
            text: getWelcomeGreeting(guestName, initialHotel),
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

  // Live GPS Handler
  const handleEnableGps = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });

        // Resolve closest known Goan locality
        if (latitude > 15.55) {
          setUserArea('Vagator / Anjuna, North Goa');
        } else if (latitude > 15.45) {
          setUserArea('Candolim / Sinquerim, North Goa');
        } else if (latitude > 15.25) {
          setUserArea('Majorda / Arossim, South Goa');
        } else {
          setUserArea('Cavelossim / Mobor, South Goa');
        }

        // Show toast confirmation
        setToastAlert({
          id: `gps-${Date.now()}`,
          type: 'concierge',
          severity: 'info',
          icon: '📍',
          title: 'Live GPS Location Enabled',
          message: `Your proximity is calibrated near ${userArea}. Concierge recommendations are now hyper-localized!`,
          recommended_action: 'Ask Concierge: "What is near me?"'
        });
        setTimeout(() => setToastAlert(null), 5000);
      },
      (error) => {
        console.warn('Geolocation denied or unavailable:', error.message);
        setToastAlert({
          id: `gps-err-${Date.now()}`,
          type: 'concierge',
          severity: 'tip',
          icon: '🏨',
          title: 'Using Resort Location',
          message: 'Location access was unavailable — showing recommendations relative to your hotel.',
          recommended_action: 'All distances calculated from hotel origin'
        });
        setTimeout(() => setToastAlert(null), 4000);
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, [userArea]);

  // Auth & Access Control
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('concierge_user', JSON.stringify(user));
    localStorage.setItem('concierge_guest_name', user.name);

    if (currentBooking) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('explore');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentBooking(null);
    localStorage.removeItem('concierge_user');
    localStorage.removeItem('concierge_current_booking');
    localStorage.removeItem('concierge_guest_name');
    localStorage.removeItem('concierge_active_hotel_id');
    setCurrentView('landing');
    setActiveTab('overview');
  };

  // Judge Demo Seeder
  const handleJudgeDemo = () => {
    const demoUser: User = {
      id: 'judge-demo-user',
      name: 'Aditya Sharma',
      email: 'aditya.sharma@example.com',
      phone: '+91 98765 43210'
    };

    const tajHotel = bookings.find(b => b.id === 'taj-fort-aguada') || {
      id: 'taj-fort-aguada',
      name: 'Taj Fort Aguada Resort & Spa',
      area: 'Sinquerim / Candolim',
      region: 'North Goa',
      latitude: 15.4952,
      longitude: 73.7667,
      startingPrice: 22000,
      propertyType: 'Luxury Heritage Resort',
      rating: 4.8,
      reviewCount: 3420,
      description: 'Perched on the cliffside overlooking the Arabian Sea, this legendary 5-star heritage resort is built on the ramparts of a 16th-century Portuguese fortress.',
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'],
      amenities: ['Private Beach Access', 'Infinity Pool', 'Jiva Spa', '24/7 Concierge'],
      rooms: [
        { id: 'taj-room-2', name: 'Deluxe Sea View Suite', capacity: 3, pricePerNight: 29000 }
      ]
    } as HotelBooking;

    const demoBooking: Booking = {
      id: 'GOA-TAJ-89421',
      userId: demoUser.id,
      hotelId: tajHotel.id,
      hotelName: tajHotel.name,
      hotelLocation: `${tajHotel.area}, ${tajHotel.region}`,
      hotelImage: tajHotel.images?.[0] || tajHotel.image_url,
      checkIn: '2026-09-18',
      checkInFormatted: 'Sep 18, 2026',
      checkOut: '2026-09-21',
      checkOutFormatted: 'Sep 21, 2026',
      nights: 3,
      guests: 2,
      room: tajHotel.rooms?.[1] || tajHotel.rooms?.[0] || { id: 'taj-room-2', name: 'Deluxe Sea View Suite', capacity: 3, pricePerNight: 29000 },
      subtotal: 66000,
      gst: 11880,
      totalAmount: 77880,
      status: 'CONFIRMED',
      guestName: demoUser.name,
      guestEmail: demoUser.email,
      guestPhone: demoUser.phone,
      createdAt: new Date().toISOString()
    };

    setCurrentUser(demoUser);
    setCurrentBooking(demoBooking);
    localStorage.setItem('concierge_user', JSON.stringify(demoUser));
    localStorage.setItem('concierge_current_booking', JSON.stringify(demoBooking));
    localStorage.setItem('concierge_guest_name', demoUser.name);
    localStorage.setItem('concierge_active_hotel_id', tajHotel.id);

    setActiveHotelId(tajHotel.id);
    setCurrentView('dashboard');
    setActiveTab('overview');

    loadItinerary(tajHotel.id, 3, true, demoUser.name, demoBooking.checkIn);

    setChatMessages([
      {
        id: 'judge-welcome',
        sender: 'assistant',
        text: `Namaste ${demoUser.name}! Welcome to **${tajHotel.name}** (${tajHotel.area}).\n\n⚡ **Judge Demo Mode Activated**: Your booking \`${demoBooking.id}\` is confirmed. Your 24/7 AI Concierge, GPS proximity engine, and day-by-day itinerary are active!\n\nTry asking:\n• *"Where should I eat tonight?"*\n• *"What beaches are near me?"*\n• *"Plan my evening."*\n• *"Change my itinerary because of rain."*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: 'Anthropic Claude / Local Grounded Concierge'
      }
    ]);
  };

  const handleUpdateGuestName = (newName: string) => {
    if (currentUser) {
      const updated = { ...currentUser, name: newName };
      setCurrentUser(updated);
      localStorage.setItem('concierge_user', JSON.stringify(updated));
    }
    localStorage.setItem('concierge_guest_name', newName);

    if (activeHotelId) {
      loadItinerary(activeHotelId, 3, false, newName);
    }
  };

  const handleSwitchHotel = async (hotelId: string, targetTab?: string) => {
    setActiveHotelId(hotelId);
    localStorage.setItem('concierge_active_hotel_id', hotelId);

    const switchedHotel = bookings.find(b => b.id === hotelId);

    try {
      const [contextRes, alertsRes, transportRes] = await Promise.all([
        fetchTripContext(hotelId),
        fetchAlerts(hotelId),
        fetchTransportGuide(hotelId),
      ]);

      setTripContext(contextRes);
      setAlerts(alertsRes.alerts || []);
      setUnreadAlertCount((alertsRes.alerts || []).length);
      setTransportItems(transportRes.guide || []);

      await loadItinerary(hotelId, 3, false, guestName, contextRes?.check_in);

      const switchHotelObj = switchedHotel || contextRes.hotel;
      const hotelSwitchMsg: ChatMessage = {
        id: `switch-${Date.now()}`,
        sender: 'assistant',
        text: `You are now interacting with the concierge desk at **${switchHotelObj?.name || 'your hotel'}** in ${switchHotelObj?.area || 'Goa'}.\n\nAll dining recommendations, beach forecasts, and travel routes are now calibrated to your new resort location.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: `${switchHotelObj?.name || 'Concierge'} System`
      };
      setChatMessages(prev => [...prev, hotelSwitchMsg]);

      if (targetTab) {
        setActiveTab(targetTab);
      }
    } catch (err) {
      console.error('Error switching hotel:', err);
    }
  };

  const loadItinerary = async (
    hotelId: string,
    days: number = 3,
    triggerConfetti: boolean = false,
    nameParam?: string,
    startDate?: string
  ) => {
    setItineraryLoading(true);
    try {
      const activeName = nameParam !== undefined ? nameParam : guestName;
      const start = startDate || currentBooking?.checkIn || tripContext?.check_in;
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

    if (currentView !== 'dashboard') {
      setCurrentView('dashboard');
    }
    if (activeTab !== 'chat') {
      setActiveTab('chat');
    }

    try {
      const historyPayload = updatedHistory.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const langInstruction = getLanguageInstruction(lang);
      const queryWithLang = langInstruction ? `${langInstruction}\n\n${text}` : text;

      const res = await sendChatMessage(
        queryWithLang,
        historyPayload,
        guestName,
        activeHotelId,
        userCoords?.lat,
        userCoords?.lng
      );

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
    if (currentView !== 'dashboard') {
      setCurrentView('dashboard');
    }
    setActiveTab('chat');
    handleSendMessage(`Tell me more about visiting ${placeName} from ${activeHotel?.name || 'my hotel'}, and what is the best time and must-try experience?`);
  };

  const handleAlertAction = (alert: SmartAlert) => {
    if (currentView !== 'dashboard') {
      setCurrentView('dashboard');
    }
    setActiveTab('chat');
    handleSendMessage(`Regarding the alert "${alert.title}", what should I do next? ${alert.recommended_action}`);
  };

  // Hotel Selection & Booking Flow
  const handleSelectHotel = (hotel: HotelBooking) => {
    setSelectedHotelForDetails(hotel);
    setCurrentView('hotel-details');
  };

  const handleBookHotelDirect = (hotel: HotelBooking) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const fourDaysLater = new Date(tomorrow);
    fourDaysLater.setDate(fourDaysLater.getDate() + 3);

    const room = hotel.rooms?.[0] || {
      id: 'room-std',
      name: 'Superior Garden View Room',
      capacity: 2,
      pricePerNight: hotel.startingPrice || 22000
    };

    const subtotal = room.pricePerNight * 3;
    const gst = Math.round(subtotal * 0.18);

    setCheckoutConfig({
      hotel,
      room,
      checkIn: tomorrow.toISOString().split('T')[0],
      checkInFormatted: tomorrow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      checkOut: fourDaysLater.toISOString().split('T')[0],
      checkOutFormatted: fourDaysLater.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      nights: 3,
      guests: 2,
      subtotal,
      gst,
      totalAmount: subtotal + gst
    });

    if (!currentUser) {
      setAuthModalMode('signup');
      setIsAuthModalOpen(true);
    } else {
      setIsCheckoutModalOpen(true);
    }
  };

  const handleProceedToCheckout = (config: any) => {
    setCheckoutConfig(config);
    if (!currentUser) {
      setAuthModalMode('signup');
      setIsAuthModalOpen(true);
    } else {
      setIsCheckoutModalOpen(true);
    }
  };

  const handleConfirmBooking = (booking: Booking) => {
    setCurrentBooking(booking);
    localStorage.setItem('concierge_current_booking', JSON.stringify(booking));
    localStorage.setItem('concierge_active_hotel_id', booking.hotelId);
    setActiveHotelId(booking.hotelId);
    setIsCheckoutModalOpen(false);
    setCurrentView('confirmation');
  };

  const handleStartJourney = () => {
    setCurrentView('dashboard');
    setActiveTab('overview');
    if (currentBooking) {
      loadItinerary(currentBooking.hotelId, 3, true, currentBooking.guestName, currentBooking.checkIn);
      setChatMessages([
        {
          id: `start-${Date.now()}`,
          sender: 'assistant',
          text: `Namaste ${currentBooking.guestName}! Welcome to your active Goa journey at **${currentBooking.hotelName}** (${currentBooking.hotelLocation}).\n\nYour booking reference \`${currentBooking.id}\` is confirmed for **${currentBooking.checkInFormatted} → ${currentBooking.checkOutFormatted}**.\n\nI am your dedicated 24/7 AI Concierge. What would you like to explore first?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          provider: `${currentBooking.hotelName} Concierge Engine`
        }
      ]);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div style={{
          background: 'linear-gradient(90deg, #991B1B, #B91C1C)',
          color: '#FFFFFF',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '0.82rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          zIndex: 100
        }}>
          <span>📶</span>
          <span>{t('offlineMode', lang)}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        currentBooking={currentBooking}
        onOpenAuthModal={(mode) => {
          setAuthModalMode(mode);
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onJudgeDemo={handleJudgeDemo}
        tripContext={tripContext}
        activeTab={activeTab}
        setActiveTab={(t) => {
          setActiveTab(t);
          if (t === 'alerts') setUnreadAlertCount(0);
        }}
        unreadAlertCount={unreadAlertCount}
        bookings={bookings}
        activeHotelId={activeHotelId}
        onSwitchHotel={(id) => handleSwitchHotel(id)}
        lang={lang}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {/* VIEW 1: LANDING PAGE */}
        {currentView === 'landing' && (
          <LandingPage
            hotels={bookings}
            onExploreClick={() => setCurrentView('explore')}
            onHotelClick={handleSelectHotel}
            onLoginClick={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            onJudgeDemoClick={handleJudgeDemo}
            onOpenConcierge={(prompt) => {
              handleJudgeDemo();
              setActiveTab('chat');
              if (prompt) {
                setTimeout(() => handleSendMessage(prompt), 300);
              }
            }}
            onOpenMap={() => {
              handleJudgeDemo();
              setActiveTab('map');
            }}
          />
        )}

        {/* VIEW 2: HOTEL DISCOVERY / EXPLORE PAGE */}
        {currentView === 'explore' && (
          <HotelDiscovery
            onSelectHotel={handleSelectHotel}
            onBookHotel={handleBookHotelDirect}
          />
        )}

        {/* VIEW 3: HOTEL DETAILS */}
        {currentView === 'hotel-details' && selectedHotelForDetails && (
          <HotelDetails
            hotel={selectedHotelForDetails}
            onBack={() => setCurrentView('explore')}
            onProceedToCheckout={handleProceedToCheckout}
          />
        )}

        {/* VIEW 4: BOOKING CONFIRMATION SCREEN */}
        {currentView === 'confirmation' && currentBooking && (
          <BookingConfirmation
            booking={currentBooking}
            onStartJourney={handleStartJourney}
          />
        )}

        {/* VIEW 5: POST-BOOKING OPERATING SYSTEM DASHBOARD */}
        {currentView === 'dashboard' && (
          <div>
            {/* Active Tab: Overview (Complete Editorial Digital Travel Journal) */}
            {activeTab === 'overview' && (
              <MyTripJourney
                itineraryData={itineraryData}
                loading={itineraryLoading}
                activeHotel={activeHotel}
                currentBooking={currentBooking}
                tripContext={tripContext}
                guestName={guestName}
                onUpdateGuestName={handleUpdateGuestName}
                onEnableGps={handleEnableGps}
                userCoords={userCoords}
                userArea={userArea}
                onGenerate={(days) => loadItinerary(activeHotelId, days, true)}
                onAskConcierge={handleSendMessage}
                onOpenExplore={() => setCurrentView('explore')}
                onOpenMap={() => setActiveTab('map')}
              />
            )}

            {/* Other Sub-Tabs Container */}
            {activeTab !== 'overview' && (
              <div className="app-container" style={{ padding: '24px 20px 48px' }}>

            {activeTab === 'map' && (
              <MapView
                activeHotel={activeHotel}
                itineraryData={itineraryData}
                onAskConcierge={handleAskConciergeAboutPlace}
                theme={theme}
                lang={lang}
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

            {activeTab === 'bookings' && (
              <BookingsView
                bookings={bookings}
                activeHotelId={activeHotelId}
                guestName={guestName}
                onSelectBooking={(id) => handleSwitchHotel(id, 'overview')}
                onOpenConcierge={(id) => handleSwitchHotel(id, 'chat')}
                onPlanTrip={(id) => handleSwitchHotel(id, 'overview')}
                onViewDetails={(h) => {
                  setSelectedBookingForModal(h);
                  setIsBookingModalOpen(true);
                }}
              />
            )}
              </div>
            )}
          </div>
        )}
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
            borderRadius: '10px',
            padding: '16px 18px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
            border: '1px solid rgba(226, 132, 69, 0.4)',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            cursor: 'pointer',
          }}
          className="animate-fade-in"
          onClick={() => {
            if (currentView === 'dashboard') {
              setActiveTab('alerts');
            }
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={(user) => {
          handleLogin(user);
          if (checkoutConfig) {
            setIsCheckoutModalOpen(true);
          }
        }}
        initialMode={authModalMode}
      />

      {/* Checkout Modal */}
      {checkoutConfig && (
        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          bookingConfig={checkoutConfig}
          currentUser={currentUser}
          onConfirmBooking={handleConfirmBooking}
        />
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

      {/* Goa Transit & Taxi Fare Estimator Modal */}
      <TransitEstimatorModal
        isOpen={isTransitEstimatorOpen}
        onClose={() => setIsTransitEstimatorOpen(false)}
        activeHotel={activeHotel}
        onAskConcierge={handleSendMessage}
      />

      {/* Trip Budget Modal */}
      <TripBudgetModal
        isOpen={isBudgetOpen}
        onClose={() => setIsBudgetOpen(false)}
        itineraryData={itineraryData}
        activeHotel={activeHotel}
      />

      {/* AI Smart Packing Checklist Modal */}
      <PackingChecklistModal
        isOpen={isPackingOpen}
        onClose={() => setIsPackingOpen(false)}
        activeHotel={activeHotel}
      />

      {/* Global Footer */}
      <footer style={{
        background: '#0B1626',
        color: '#94A3B8',
        padding: '24px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '0.84rem'
      }}>
        <div className="app-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong style={{ color: '#FFFFFF' }}>AI Trip Concierge</strong> • {activeHotel?.name || 'Taj Fort Aguada Resort & Spa'}
          </div>
          <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', alignItems: 'center' }}>
            <span>{activeHotel?.area || 'Sinquerim, Candolim'}, {activeHotel?.region || 'North Goa'}</span>
            <span>•</span>
            <span style={{ color: '#E28445' }}>24/7 Luxury Traveller OS</span>
            <span>•</span>
            <span style={{ color: '#10B981' }}>{isOnline ? '🟢 Online' : '🟠 Offline Mode'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
