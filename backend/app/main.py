import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .tools import (
    load_data,
    get_hotels,
    get_hotel_info,
    search_restaurants,
    search_activities,
    search_nearby_places,
    get_transport_tips,
    get_place_details,
    get_weather_and_tide_info,
    _resolve_distance
)
from .agent import agent_instance
from .itinerary import generate_itinerary
from .alerts import get_active_alerts, simulate_alert
from .weather import get_real_weather_for_location, geocode_location

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_concierge.main")

app = FastAPI(
    title="AI Trip Concierge API",
    description="Post-Booking Travel Companion Backend — Complete End-to-End Traveller Journey",
    version="3.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── In-memory custom trip storage ───
_custom_trip: Dict[str, Any] = {}

def get_custom_trip() -> Optional[Dict[str, Any]]:
    if _custom_trip and _custom_trip.get("destination"):
        return _custom_trip
    return None

# ─── Pydantic Request Models ───

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., description="User message to the concierge")
    history: Optional[List[ChatMessage]] = Field(default=[], description="Previous conversation turns")
    guest_name: Optional[str] = Field(default=None, description="Active guest name if provided")
    hotel_id: Optional[str] = Field(default="taj-fort-aguada", description="Active hotel ID")
    user_lat: Optional[float] = Field(default=None, description="Live GPS Latitude")
    user_lng: Optional[float] = Field(default=None, description="Live GPS Longitude")

class ItineraryRequest(BaseModel):
    hotel_id: Optional[str] = Field(default="taj-fort-aguada", description="Active hotel booking ID")
    days: int = Field(default=3, ge=1, le=5, description="Number of days for the itinerary (1-5)")
    focus: Optional[str] = Field(default="balanced", description="Theme focus: balanced, beaches, culture, nightlife")
    guest_name: Optional[str] = Field(default=None, description="Active guest name if provided")
    start_date: Optional[str] = Field(default=None, description="Trip start date (YYYY-MM-DD)")

class AlertSimulateRequest(BaseModel):
    hotel_id: Optional[str] = Field(default="taj-fort-aguada", description="Active hotel ID")
    alert_type: Optional[str] = Field(default="rain_baga", description="Type of alert to simulate")

class TripSetupRequest(BaseModel):
    destination: str = Field(..., description="Destination city/place")
    hotel_name: Optional[str] = Field(default="My Hotel", description="Hotel/stay name")
    check_in: Optional[str] = Field(default=None, description="Check-in date (YYYY-MM-DD)")
    check_out: Optional[str] = Field(default=None, description="Check-out date (YYYY-MM-DD)")
    guest_name: Optional[str] = Field(default=None, description="Guest name")

# ─── ENDPOINTS ───

@app.get("/")
def root():
    """Root status endpoint."""
    return {
        "status": "ok",
        "service": "AI Trip Concierge API",
        "version": "3.0.0"
    }

@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "AI Trip Concierge Backend",
        "version": "3.0.0",
        "hotels_count": len(get_hotels())
    }

@app.get("/api/coastal-conditions")
def get_coastal_conditions(hotel_id: Optional[str] = Query("taj-fort-aguada")):
    """Retrieve sunset, high/low tides, and ocean swim safety info."""
    weather = get_weather_and_tide_info(hotel_id=hotel_id or "taj-fort-aguada")
    return {
        "sunset": weather.get("sunset_time", "6:24 PM"),
        "golden_hour": "5:50 PM - 6:35 PM",
        "tide": weather.get("tide_status", "Low Tide (Best for walking)"),
        "tide_height": "0.4m",
        "ocean": weather.get("swim_safety", "Safe for swimming inside designated flag zones"),
        "uv_index": "Moderate (4)",
        "water_temp": "28°C"
    }

@app.get("/api/hotels")
def list_hotels(
    search: Optional[str] = Query(default=None, description="Search keyword"),
    region: Optional[str] = Query(default=None, description="Region filter: North Goa, South Goa"),
    area: Optional[str] = Query(default=None, description="Area filter"),
    maxPrice: Optional[float] = Query(default=None, description="Maximum starting price per night")
):
    """Retrieve verified Goa hotel properties with optional search, region, area, and maxPrice filtering."""
    hotels = get_hotels(search=search, region=region, area=area, max_price=maxPrice)
    return {
        "count": len(hotels),
        "hotels": hotels,
        "properties": hotels  # For dual frontend compatibility
    }

@app.get("/api/hotels/{hotel_id}")
def get_hotel_by_id(hotel_id: str):
    """Get single hotel details by ID."""
    hotel = get_hotel_info(hotel_id)
    if not hotel or hotel.get("id") != hotel_id:
        # Check case-insensitive match
        for h in get_hotels():
            if h.get("id", "").lower() == hotel_id.lower():
                return h
        raise HTTPException(status_code=404, detail=f"Hotel '{hotel_id}' not found")
    return hotel

@app.get("/api/trip-context")
def get_trip_context(hotel_id: Optional[str] = Query("taj-fort-aguada", description="Selected hotel booking ID")):
    """Retrieve full trip context with dynamic calendar dates and weather."""
    active_h_id = hotel_id or "taj-fort-aguada"
    hotel = get_hotel_info(active_h_id)
    weather = get_weather_and_tide_info(hotel_id=active_h_id)
    alerts = get_active_alerts(hotel_id=active_h_id)

    today = datetime.now().date()
    check_in = hotel.get("check_in", (today + timedelta(days=1)).strftime("%Y-%m-%d"))
    check_out = hotel.get("check_out", (today + timedelta(days=4)).strftime("%Y-%m-%d"))

    try:
        ci_date = datetime.strptime(check_in, "%Y-%m-%d").date()
        days_until = max(0, (ci_date - today).days)
    except Exception:
        days_until = 1

    return {
        "active_hotel_id": active_h_id,
        "hotel": hotel,
        "destination": "Goa, India",
        "stay": f"{hotel.get('name')} ({hotel.get('area')})",
        "guest_name": hotel.get("guest_name", "Aditya Sharma"),
        "room_type": hotel.get("room_type", "Sea View Luxury Suite"),
        "confirmation_code": hotel.get("confirmation_code", "GOA-TAJ-89421"),
        "current_date": today.strftime("%Y-%m-%d"),
        "current_date_formatted": today.strftime("%A, %b %d, %Y"),
        "check_in": check_in,
        "check_in_formatted": hotel.get("check_in_formatted", check_in),
        "check_out": check_out,
        "check_out_formatted": hotel.get("check_out_formatted", check_out),
        "duration": hotel.get("duration", "3 Nights / 4 Days"),
        "days_until_checkin": days_until,
        "weather_summary": weather,
        "active_alerts_count": len(alerts),
        "is_custom_trip": False,
    }

@app.post("/api/chat")
def chat_with_concierge(req: ChatRequest):
    """Conversational endpoint with full context awareness, live GPS, and automatic fallback."""
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    history_dicts = [{"role": m.role, "content": m.content} for m in req.history] if req.history else []
    hotel_id = req.hotel_id or "taj-fort-aguada"

    try:
        response = agent_instance.chat(
            req.message,
            history_dicts,
            guest_name=req.guest_name,
            hotel_id=hotel_id,
            user_lat=req.user_lat,
            user_lng=req.user_lng
        )
        return response
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}", exc_info=True)
        # Always return a graceful fallback response rather than 500 error
        return {
            "reply": f"Namaste! As your Goa concierge, I'm here to assist your stay at {hotel_id}. Please ask me about nearby dining, quiet morning beaches, local transport, or weather-adapted plans!",
            "tool_calls": [],
            "cards": search_nearby_places(hotel_id=hotel_id, limit=2),
            "provider": "Local Concierge Mode (Zero-Key Grounded Engine)",
            "hotel_origin": "Goa Resort Concierge"
        }

@app.post("/api/itinerary/generate")
def create_itinerary(req: ItineraryRequest):
    """Generate rich 1-5 day itinerary sequenced realistically from active hotel."""
    hotel_id = req.hotel_id or "taj-fort-aguada"
    return generate_itinerary(
        hotel_id=hotel_id,
        days=req.days,
        focus=req.focus or "balanced",
        guest_name=req.guest_name,
        start_date=req.start_date
    )

@app.get("/api/recommendations")
def list_recommendations(
    hotel_id: Optional[str] = Query(default="taj-fort-aguada", description="Active hotel ID"),
    category: Optional[str] = Query(default=None, description="Category filter"),
    area: Optional[str] = Query(default=None, description="Area filter"),
    search: Optional[str] = Query(default=None, description="Keyword search"),
    lat: Optional[float] = Query(default=None, description="Live GPS Latitude"),
    lng: Optional[float] = Query(default=None, description="Live GPS Longitude")
):
    """Get places matching filters with distances calculated relative to active hotel or live GPS."""
    active_h_id = hotel_id if isinstance(hotel_id, str) else "taj-fort-aguada"
    data = load_data()
    places = data.get("places", [])

    resolved_places = []
    for p in places:
        p_copy = dict(p)
        p_copy["distance_from_hotel"] = _resolve_distance(p_copy, active_h_id, user_lat=lat, user_lng=lng)
        resolved_places.append(p_copy)

    filtered = resolved_places
    if category and isinstance(category, str) and category.lower() != "all":
        cat_lower = category.lower()
        filtered = [p for p in filtered if p.get("category", "").lower() == cat_lower]

    if area and isinstance(area, str) and area.lower() != "all":
        area_lower = area.lower()
        filtered = [p for p in filtered if area_lower in p.get("area", "").lower() or area_lower in p.get("region", "").lower()]

    if search and isinstance(search, str):
        s_lower = search.lower()
        filtered = [
            p for p in filtered if s_lower in p.get("name", "").lower()
            or s_lower in p.get("description", "").lower()
            or s_lower in p.get("cuisine", "").lower()
            or any(s_lower in t.lower() for t in p.get("tags", []))
        ]

    return {
        "count": len(filtered),
        "places": filtered
    }

@app.get("/api/recommendations/{place_id}")
def get_place(
    place_id: str,
    hotel_id: Optional[str] = Query("taj-fort-aguada", description="Active hotel ID")
):
    """Get single place detail relative to selected hotel."""
    place = get_place_details(place_id, hotel_id=hotel_id or "taj-fort-aguada")
    if not place:
        raise HTTPException(status_code=404, detail="Place not found in knowledge base")
    return place

@app.get("/api/alerts")
def get_alerts(hotel_id: Optional[str] = Query("taj-fort-aguada", description="Active hotel ID")):
    """Retrieve proactive alerts for the active hotel stay."""
    return {
        "alerts": get_active_alerts(hotel_id=hotel_id or "taj-fort-aguada")
    }

@app.post("/api/alerts/simulate")
def trigger_alert_simulation(req: AlertSimulateRequest):
    """Simulate a live proactive alert event."""
    alert = simulate_alert(hotel_id=req.hotel_id or "taj-fort-aguada", alert_type=req.alert_type or "rain_baga")
    return {
        "status": "success",
        "alert": alert
    }

@app.get("/api/transport-guide")
def get_transport(hotel_id: Optional[str] = Query("taj-fort-aguada")):
    """Retrieve transportation options and tips."""
    return {
        "guide": get_transport_tips(hotel_id=hotel_id or "taj-fort-aguada")
    }

@app.get("/api/weather")
def get_weather(
    hotel_id: Optional[str] = Query("taj-fort-aguada"),
    area: Optional[str] = Query(None)
):
    """Retrieve weather and tide info for active hotel."""
    return get_weather_and_tide_info(area=area, hotel_id=hotel_id or "taj-fort-aguada")
