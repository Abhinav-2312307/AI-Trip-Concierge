import type { TripContext, ItineraryResponse, Place, SmartAlert, TransportGuideItem, HotelBooking, TripSetupRequest } from '../types';

const API_BASE = 'http://localhost:8000/api';

export async function fetchBookings(): Promise<{ count: number; hotels: HotelBooking[] }> {
  const res = await fetch(`${API_BASE}/hotels`);
  if (!res.ok) throw new Error('Failed to fetch hotel bookings');
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
  hotelId?: string
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
      hotel_id: hotelId || 'taj-fort-aguada'
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
  search?: string
): Promise<{ count: number; places: Place[] }> {
  const params = new URLSearchParams();
  if (hotelId) params.append('hotel_id', hotelId);
  if (category && category !== 'all') params.append('category', category);
  if (area && area !== 'all') params.append('area', area);
  if (search) params.append('search', search);

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
