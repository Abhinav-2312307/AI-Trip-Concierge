import type {
  TripContext,
  ItineraryResponse,
  Place,
  SmartAlert,
  TransportGuideItem,
  HotelBooking,
  TripSetupRequest,
  ReviewSummary,
  HotelReview,
  ReviewCreatePayload,
  ChatFeedbackPayload
} from '../types';

const API_BASE = 'http://localhost:8000/api';

export async function fetchBookings(
  search?: string,
  region?: string,
  area?: string,
  maxPrice?: number
): Promise<{ count: number; hotels: HotelBooking[] }> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (region && region !== 'all' && region !== 'All Goa') params.append('region', region);
  if (area && area !== 'all' && area !== 'All Localities') params.append('area', area);
  if (maxPrice) params.append('maxPrice', maxPrice.toString());

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/hotels${queryStr}`);
  if (!res.ok) throw new Error('Failed to fetch hotels');
  const data = await res.json();
  const hotels = data.hotels || data.properties || [];
  return {
    count: data.count !== undefined ? data.count : hotels.length,
    hotels
  };
}

export async function fetchHotelDetails(hotelId: string): Promise<HotelBooking> {
  const res = await fetch(`${API_BASE}/hotels/${encodeURIComponent(hotelId)}`);
  if (!res.ok) throw new Error(`Failed to fetch hotel details for ${hotelId}`);
  return res.json();
}

export async function fetchTripContext(hotelId?: string): Promise<TripContext> {
  const url = hotelId ? `${API_BASE}/trip-context?hotel_id=${encodeURIComponent(hotelId)}` : `${API_BASE}/trip-context`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch trip context');
  return res.json();
}

export async function sendChatMessage(
  message: string,
  history: Array<{ role: string; content: string }>,
  guestName?: string,
  hotelId?: string,
  userLat?: number,
  userLng?: number
): Promise<{
  reply: string;
  tool_calls?: Array<{ tool: string; input: Record<string, any> }>;
  cards?: Place[];
  provider?: string;
  hotel_origin?: string;
}> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history,
      guest_name: guestName,
      hotel_id: hotelId || 'taj-fort-aguada',
      user_lat: userLat,
      user_lng: userLng
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(err.detail || 'Failed to send chat message');
  }
  return res.json();
}

export async function generateItinerary(
  hotelId: string = 'taj-fort-aguada',
  days: number = 3,
  focus: string = 'balanced',
  guestName?: string,
  startDate?: string
): Promise<ItineraryResponse> {
  const res = await fetch(`${API_BASE}/itinerary/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hotel_id: hotelId,
      days,
      focus,
      guest_name: guestName,
      start_date: startDate
    }),
  });
  if (!res.ok) throw new Error('Failed to generate itinerary');
  return res.json();
}

export async function fetchRecommendations(
  hotelId?: string,
  category?: string,
  area?: string,
  search?: string,
  lat?: number,
  lng?: number
): Promise<{ count: number; places: Place[] }> {
  const params = new URLSearchParams();
  if (hotelId) params.append('hotel_id', hotelId);
  if (category && category !== 'all') params.append('category', category);
  if (area && area !== 'all') params.append('area', area);
  if (search) params.append('search', search);
  if (lat !== undefined) params.append('lat', lat.toString());
  if (lng !== undefined) params.append('lng', lng.toString());

  const res = await fetch(`${API_BASE}/recommendations?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function fetchAlerts(hotelId?: string): Promise<{ alerts: SmartAlert[] }> {
  const url = hotelId ? `${API_BASE}/alerts?hotel_id=${encodeURIComponent(hotelId)}` : `${API_BASE}/alerts`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function simulateAlert(
  hotelId: string = 'taj-fort-aguada',
  alertType: string = 'rain_baga'
): Promise<{ status: string; alert: SmartAlert }> {
  const res = await fetch(`${API_BASE}/alerts/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hotel_id: hotelId,
      alert_type: alertType
    }),
  });
  if (!res.ok) throw new Error('Failed to simulate alert');
  return res.json();
}

export async function fetchTransportGuide(hotelId?: string): Promise<{ guide: TransportGuideItem[] }> {
  const url = hotelId ? `${API_BASE}/transport-guide?hotel_id=${encodeURIComponent(hotelId)}` : `${API_BASE}/transport-guide`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch transport guide');
  return res.json();
}

export async function setupCustomTrip(data: TripSetupRequest): Promise<any> {
  const res = await fetch(`${API_BASE}/trip/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to setup trip' }));
    throw new Error(err.detail || 'Failed to setup trip');
  }
  return res.json();
}

export async function clearCustomTrip(): Promise<any> {
  const res = await fetch(`${API_BASE}/trip/clear`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to clear trip');
  return res.json();
}

// ─── REVIEW & FEEDBACK API ───

export async function fetchHotelReviews(
  hotelId?: string,
  travelType?: string,
  minRating?: number
): Promise<ReviewSummary> {
  const params = new URLSearchParams();
  if (hotelId) params.append('hotel_id', hotelId);
  if (travelType && travelType !== 'all') params.append('travel_type', travelType);
  if (minRating) params.append('min_rating', minRating.toString());

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/reviews${queryStr}`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function submitHotelReview(
  payload: ReviewCreatePayload
): Promise<{ status: string; message: string; review: HotelReview }> {
  const res = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to submit review' }));
    throw new Error(err.detail || 'Failed to submit review');
  }
  return res.json();
}

export async function voteReviewHelpful(
  reviewId: string
): Promise<{ status: string; review_id: string; helpful_count: number }> {
  const res = await fetch(`${API_BASE}/reviews/${encodeURIComponent(reviewId)}/helpful`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to vote review helpful');
  return res.json();
}

export async function submitChatFeedback(
  payload: ChatFeedbackPayload
): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/feedback/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit chat feedback');
  return res.json();
}
