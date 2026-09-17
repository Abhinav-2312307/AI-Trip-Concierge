import type { TripContext, ItineraryResponse, Place, SmartAlert, TransportGuideItem } from '../types';

const API_BASE = 'http://localhost:8000/api';

export async function fetchTripContext(): Promise<TripContext> {
  const res = await fetch(`${API_BASE}/trip-context`);
  if (!res.ok) throw new Error('Failed to fetch trip context');
  return res.json();
}

export async function sendChatMessage(
  message: string,
  history: Array<{ role: string; content: string }>,
  guestName?: string
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
    body: JSON.stringify({ message, history, guest_name: guestName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(err.detail || 'Failed to send chat message');
  }
  return res.json();
}

export async function generateItinerary(
  days: number = 3,
  focus: string = 'balanced',
  guestName?: string,
  startDate?: string
): Promise<ItineraryResponse> {
  const res = await fetch(`${API_BASE}/itinerary/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ days, focus, guest_name: guestName, start_date: startDate }),
  });
  if (!res.ok) throw new Error('Failed to generate itinerary');
  return res.json();
}

export async function fetchRecommendations(category?: string, area?: string, search?: string): Promise<{ count: number; places: Place[] }> {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (area && area !== 'all') params.append('area', area);
  if (search) params.append('search', search);

  const res = await fetch(`${API_BASE}/recommendations?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function fetchAlerts(): Promise<{ alerts: SmartAlert[] }> {
  const res = await fetch(`${API_BASE}/alerts`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function simulateAlert(alertType: string = 'rain_baga'): Promise<{ status: string; alert: SmartAlert }> {
  const res = await fetch(`${API_BASE}/alerts/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alert_type: alertType }),
  });
  if (!res.ok) throw new Error('Failed to simulate alert');
  return res.json();
}

export async function fetchTransportGuide(): Promise<{ guide: TransportGuideItem[] }> {
  const res = await fetch(`${API_BASE}/transport-guide`);
  if (!res.ok) throw new Error('Failed to fetch transport guide');
  return res.json();
}
