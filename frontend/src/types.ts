export interface HotelRoom {
  id: string;
  name: string;
  capacity: number;
  pricePerNight: number;
}

export interface HotelProperty {
  id: string;
  name: string;
  area: string;
  region: 'North Goa' | 'South Goa' | string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  description: string;
  images: string[];
  amenities: string[];
  startingPrice: number;
  propertyType: string;
  rooms: HotelRoom[];
  address?: string;
  coordinates?: { lat: number; lng: number };
  image_url?: string;
  room_type?: string;
  check_in_time?: string;
  check_out_time?: string;
  confirmation_code?: string;
  guests_count?: number;
  guest_name?: string;
  status?: string;
  check_in?: string;
  check_in_formatted?: string;
  check_out?: string;
  check_out_formatted?: string;
  duration?: string;
  days_until_checkin?: number;
  highlights?: string[];
}

export interface HotelBooking extends HotelProperty {
  // Alias for backwards compatibility
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Booking {
  id: string;
  userId?: string;
  hotelId: string;
  hotelName: string;
  hotelLocation: string;
  hotelImage?: string;
  checkIn: string;
  checkInFormatted: string;
  checkOut: string;
  checkOutFormatted: string;
  nights: number;
  guests: number;
  room: HotelRoom;
  subtotal: number;
  gst: number;
  totalAmount: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  createdAt?: string;
}

export interface Place {
  id: string;
  name: string;
  category: 'restaurant' | 'beach' | 'culture' | 'nightlife' | 'activity';
  area: string;
  region: string;
  latitude?: number;
  longitude?: number;
  coordinates?: { lat: number; lng: number };
  cuisine?: string;
  price_range: string;
  vibe: string;
  distance_from_hotel: string;
  best_time: string;
  duration: string;
  signature_dishes?: string[];
  description: string;
  image_url: string;
  tags: string[];
}

export interface ItinerarySlot {
  time: string;
  place: Place;
  activity_title: string;
  description: string;
  duration: string;
  distance_from_hotel: string;
  budget: string;
  food_tip?: string;
}

export interface DayPlan {
  day_number: number;
  title: string;
  theme: string;
  date?: string;
  date_formatted?: string;
  full_date_formatted?: string;
  morning: ItinerarySlot;
  afternoon: ItinerarySlot;
  evening: ItinerarySlot;
}

export interface ItineraryResponse {
  hotel_id?: string;
  guest_name: string;
  hotel: string;
  total_days: number;
  start_date?: string;
  itinerary: DayPlan[];
  summary: string;
}

export interface ToolCall {
  tool: string;
  input: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  tool_calls?: ToolCall[];
  cards?: Place[];
  provider?: string;
  hotel_origin?: string;
  isAlert?: boolean;
}

export interface SmartAlert {
  id: string;
  type: 'weather' | 'concierge' | 'experience' | 'safety';
  severity: 'info' | 'warning' | 'tip';
  icon: string;
  title: string;
  message: string;
  recommended_action: string;
  action_payload?: Record<string, any>;
  timestamp?: string;
  is_simulated?: boolean;
  read?: boolean;
}

export interface TransportGuideItem {
  type: string;
  best_for: string;
  cost: string;
  tips: string;
}

export interface TripContext {
  active_hotel_id: string;
  hotel: HotelBooking;
  destination: string;
  stay: string;
  guest_name: string;
  room_type: string;
  confirmation_code: string;
  current_date?: string;
  current_date_formatted?: string;
  check_in: string;
  check_in_formatted?: string;
  check_out: string;
  check_out_formatted?: string;
  days_until_checkin?: number;
  duration: string;
  weather_summary: {
    area?: string;
    temperature_c: number;
    feels_like_c?: number;
    condition: string;
    evening_forecast?: string;
    humidity: string;
    wind_speed_kmph?: number;
    precipitation_probability?: number;
    sunset_time?: string;
    golden_hour_start?: string;
    sea_condition?: string;
    tide_schedule?: {
      low_tide: string;
      high_tide: string;
    };
    is_simulated_demo?: boolean;
    is_real_data?: boolean;
    timestamp?: string;
  };
  active_alerts_count: number;
  is_custom_trip?: boolean;
}

export interface TripSetupRequest {
  destination: string;
  hotel_name?: string;
  check_in?: string;
  check_out?: string;
  guest_name?: string;
}
