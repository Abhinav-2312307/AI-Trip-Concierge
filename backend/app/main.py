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
    get_transport_tips,
    get_place_details,
    get_weather_and_tide_info
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
    description="Post-Booking Travel Companion Backend — Works for Any Destination Worldwide",
    version="3.0.0"
)

# Enable CORS for local Vite dev server and any host
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── In-memory custom trip storage (per-session, resets on server restart) ───
_custom_trip: Dict[str, Any] = {}


def get_custom_trip() -> Optional[Dict[str, Any]]:
    """Return the active custom trip config, or None if using Goa demo mode."""
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
    destination: str = Field(..., description="Destination city/place (e.g. Manali, Paris, Bali)")
    hotel_name: Optional[str] = Field(default="My Hotel", description="Hotel/stay name")
    check_in: Optional[str] = Field(default=None, description="Check-in date (YYYY-MM-DD)")
    check_out: Optional[str] = Field(default=None, description="Check-out date (YYYY-MM-DD)")
    guest_name: Optional[str] = Field(default=None, description="Guest name")


# ─── ENDPOINTS ───

@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    custom = get_custom_trip()
    return {
        "status": "healthy",
        "service": "AI Trip Concierge Backend",
        "version": "3.0.0",
        "mode": "custom_trip" if custom else "goa_demo",
        "destination": custom["destination"] if custom else "Goa, India"
    }


@app.post("/api/trip/setup")
def setup_custom_trip(req: TripSetupRequest):
    """Set up a custom trip for any destination worldwide. Geocodes and fetches real weather."""
    global _custom_trip

    destination = req.destination.strip()
    if not destination:
        raise HTTPException(status_code=400, detail="Destination cannot be empty.")

    # Geocode the destination
    geo = geocode_location(destination)
    if not geo:
        raise HTTPException(status_code=404, detail=f"Could not find location: '{destination}'. Try a different spelling.")

    # Fetch real weather
    weather = get_real_weather_for_location(
        city_name=geo["name"],
        latitude=geo["latitude"],
        longitude=geo["longitude"],
        timezone=geo.get("timezone", "auto")
    )

    today = datetime.now().date()
    check_in = req.check_in or (today + timedelta(days=1)).strftime("%Y-%m-%d")
    check_out = req.check_out or (today + timedelta(days=4)).strftime("%Y-%m-%d")

    try:
        ci_date = datetime.strptime(check_in, "%Y-%m-%d").date()
        co_date = datetime.strptime(check_out, "%Y-%m-%d").date()
        nights = max(1, (co_date - ci_date).days)
        days_until = max(0, (ci_date - today).days)
    except Exception:
        nights = 3
        days_until = 1

    hotel_name = req.hotel_name.strip() if req.hotel_name else "My Hotel"
    guest_name = req.guest_name.strip() if req.guest_name else ""
    full_destination = f"{geo['name']}, {geo.get('admin1', '')}, {geo['country']}".replace(", ,", ",").strip(", ")

    # Store in memory
    _custom_trip.update({
        "destination": full_destination,
        "destination_short": geo["name"],
        "hotel_name": hotel_name,
        "guest_name": guest_name,
        "latitude": geo["latitude"],
        "longitude": geo["longitude"],
        "timezone": geo.get("timezone", "auto"),
        "country": geo["country"],
        "state": geo.get("admin1", ""),
        "check_in": check_in,
        "check_out": check_out,
        "nights": nights,
        "days_until_checkin": days_until,
        "weather": weather,
    })

    logger.info(f"Custom trip set up: {full_destination} at {hotel_name}")

    # Return trip context
    return {
        "status": "success",
        "active_hotel_id": "custom",
        "hotel": {
            "id": "custom",
            "name": hotel_name,
            "area": geo["name"],
            "region": geo.get("admin1", geo["country"]),
            "address": full_destination,
            "coordinates": {"lat": geo["latitude"], "lng": geo["longitude"]},
            "image_url": "",
            "room_type": "Standard Room",
            "check_in_time": "2:00 PM",
            "check_out_time": "11:00 AM",
            "confirmation_code": f"TRIP-{geo['name'][:3].upper()}-{datetime.now().strftime('%H%M')}",
            "guests_count": 2,
            "guest_name": guest_name,
            "status": "Custom Trip",
            "check_in": check_in,
            "check_in_formatted": datetime.strptime(check_in, "%Y-%m-%d").strftime("%b %d, %Y"),
            "check_out": check_out,
            "check_out_formatted": datetime.strptime(check_out, "%Y-%m-%d").strftime("%b %d, %Y"),
            "duration": f"{nights} Night{'s' if nights > 1 else ''} / {nights + 1} Days",
            "days_until_checkin": days_until,
            "amenities": [],
            "highlights": [f"Your trip to {full_destination}"],
        },
        "destination": full_destination,
        "weather_summary": weather,
    }


@app.post("/api/trip/clear")
def clear_custom_trip():
    """Clear the custom trip and return to Goa demo mode."""
    global _custom_trip
    _custom_trip = {}
    return {"status": "success", "mode": "goa_demo"}


@app.get("/api/hotels")
def list_hotel_bookings():
    """Retrieve all available verified Goa hotel bookings and sample demo reservations."""
    return {
        "count": len(get_hotels()),
        "hotels": get_hotels()
    }


@app.get("/api/trip-context")
def get_trip_context(hotel_id: Optional[str] = Query("taj-fort-aguada", description="Selected hotel booking ID")):
    """Retrieve full trip context. Uses custom trip if set up, else falls back to Goa demo."""
    custom = get_custom_trip()

    # If custom trip is active and hotel_id is "custom", use it
    if custom and (hotel_id == "custom" or hotel_id is None):
        today = datetime.now().date()
        check_in = custom["check_in"]
        check_out = custom["check_out"]
        hotel_name = custom["hotel_name"]
        dest = custom["destination"]

        # Refresh weather
        weather = get_real_weather_for_location(
            city_name=custom["destination_short"],
            latitude=custom["latitude"],
            longitude=custom["longitude"],
            timezone=custom.get("timezone", "auto")
        )

        return {
            "active_hotel_id": "custom",
            "hotel": {
                "id": "custom",
                "name": hotel_name,
                "area": custom["destination_short"],
                "region": custom.get("state", custom["country"]),
                "address": dest,
                "coordinates": {"lat": custom["latitude"], "lng": custom["longitude"]},
                "image_url": "",
                "room_type": "Standard Room",
                "check_in_time": "2:00 PM",
                "check_out_time": "11:00 AM",
                "confirmation_code": f"TRIP-{custom['destination_short'][:3].upper()}",
                "guests_count": 2,
                "guest_name": custom.get("guest_name", ""),
                "status": "Custom Trip",
                "check_in": check_in,
                "check_in_formatted": datetime.strptime(check_in, "%Y-%m-%d").strftime("%b %d, %Y"),
                "check_out": check_out,
                "check_out_formatted": datetime.strptime(check_out, "%Y-%m-%d").strftime("%b %d, %Y"),
                "duration": f"{custom['nights']} Night{'s' if custom['nights'] > 1 else ''} / {custom['nights'] + 1} Days",
                "days_until_checkin": custom["days_until_checkin"],
                "amenities": [],
                "highlights": [f"Your trip to {dest}"],
            },
            "destination": dest,
            "stay": f"{hotel_name} ({custom['destination_short']})",
            "guest_name": custom.get("guest_name", ""),
            "room_type": "Standard Room",
            "confirmation_code": f"TRIP-{custom['destination_short'][:3].upper()}",
            "current_date": today.strftime("%Y-%m-%d"),
            "current_date_formatted": today.strftime("%A, %b %d, %Y"),
            "check_in": check_in,
            "check_in_formatted": datetime.strptime(check_in, "%Y-%m-%d").strftime("%b %d, %Y"),
            "check_out": check_out,
            "check_out_formatted": datetime.strptime(check_out, "%Y-%m-%d").strftime("%b %d, %Y"),
            "duration": f"{custom['nights']} Night{'s' if custom['nights'] > 1 else ''} / {custom['nights'] + 1} Days",
            "days_until_checkin": custom["days_until_checkin"],
            "weather_summary": weather,
            "active_alerts_count": 0,
            "is_custom_trip": True,
        }

    # Fallback to Goa demo mode
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
        "guest_name": hotel.get("guest_name", ""),
        "room_type": hotel.get("room_type", "Sea View Luxury Suite"),
        "confirmation_code": hotel.get("confirmation_code", "TAJ-GOA-89421"),
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
    """Conversational endpoint — works for custom trips and Goa demo mode."""
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    history_dicts = [{"role": m.role, "content": m.content} for m in req.history] if req.history else []

    custom = get_custom_trip()
    hotel_id = req.hotel_id or "taj-fort-aguada"

    try:
        response = agent_instance.chat(
            req.message,
            history_dicts,
            guest_name=req.guest_name,
            hotel_id=hotel_id,
            custom_trip=custom
        )
        return response
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI Agent error: {str(e)}")


@app.post("/api/itinerary/generate")
def create_itinerary(req: ItineraryRequest):
    """Generate itinerary — uses LLM for custom trips, curated data for Goa."""
    custom = get_custom_trip()
    hotel_id = req.hotel_id or "taj-fort-aguada"

    return generate_itinerary(
        hotel_id=hotel_id,
        days=req.days,
        focus=req.focus or "balanced",
        guest_name=req.guest_name,
        start_date=req.start_date,
        custom_trip=custom
    )


@app.get("/api/recommendations")
def list_recommendations(
    hotel_id: Optional[str] = Query(default="taj-fort-aguada", description="Active hotel ID"),
    category: Optional[str] = Query(default=None, description="Category filter"),
    area: Optional[str] = Query(default=None, description="Area filter"),
    search: Optional[str] = Query(default=None, description="Keyword search")
):
    """Get places matching filters. For custom trips, returns empty (use chat instead)."""
    custom = get_custom_trip()
    if custom and (hotel_id == "custom"):
        # Custom trips don't have a pre-built places database
        return {"count": 0, "places": [], "note": "Use the AI Concierge chat to discover places at your destination."}

    active_h_id = hotel_id if isinstance(hotel_id, str) else "taj-fort-aguada"
    data = load_data()
    places = data.get("places", [])

    from .tools import _resolve_distance

    resolved_places = []
    for p in places:
        p_copy = dict(p)
        p_copy["distance_from_hotel"] = _resolve_distance(p_copy, active_h_id)
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
    """Retrieve proactive alerts — real weather-based for custom trips, simulated for Goa demo."""
    custom = get_custom_trip()
    if custom and (hotel_id == "custom"):
        from .alerts import get_weather_based_alerts
        return {"alerts": get_weather_based_alerts(custom)}

    return {
        "alerts": get_active_alerts(hotel_id=hotel_id or "taj-fort-aguada")
    }


@app.post("/api/alerts/simulate")
def trigger_alert_simulation(req: AlertSimulateRequest):
    """Simulate a live proactive alert event."""
    custom = get_custom_trip()
    if custom and (req.hotel_id == "custom"):
        from .alerts import simulate_weather_alert
        alert = simulate_weather_alert(custom, req.alert_type or "weather")
        return {"status": "success", "alert": alert}

    alert = simulate_alert(hotel_id=req.hotel_id or "taj-fort-aguada", alert_type=req.alert_type or "rain_baga")
    return {
        "status": "success",
        "alert": alert
    }


@app.get("/api/transport-guide")
def get_transport(hotel_id: Optional[str] = Query("taj-fort-aguada")):
    """Retrieve transportation options and tips."""
    custom = get_custom_trip()
    if custom and (hotel_id == "custom"):
        dest = custom["destination_short"]
        return {
            "guide": [
                {"type": "Local Taxi / Ride-hailing App", "best_for": f"Getting around {dest} comfortably", "cost": "Varies by distance", "tips": f"Use popular local ride-hailing apps available in {dest}. Always confirm the fare before boarding."},
                {"type": "Public Transport", "best_for": "Budget-friendly commuting", "cost": "Low cost", "tips": f"Check local bus/metro routes in {dest}. Great for short distances and city exploration."},
                {"type": "Rental Car / Bike", "best_for": "Day trips and flexible sightseeing", "cost": "₹500-3000/day depending on vehicle", "tips": "Carry valid driving license. Check local traffic rules and fuel availability."},
                {"type": "Walking Tours", "best_for": "Exploring the city center and heritage areas", "cost": "Free or guided tours ₹500-1500", "tips": f"Best way to discover hidden gems in {dest}. Wear comfortable shoes."},
            ]
        }

    return {
        "guide": get_transport_tips(hotel_id=hotel_id or "taj-fort-aguada")
    }


@app.get("/api/weather")
def get_weather(
    hotel_id: Optional[str] = Query("taj-fort-aguada"),
    area: Optional[str] = Query(None)
):
    """Retrieve weather — real data for custom trips, simulated for Goa demo."""
    custom = get_custom_trip()
    if custom and (hotel_id == "custom"):
        return get_real_weather_for_location(
            city_name=custom["destination_short"],
            latitude=custom["latitude"],
            longitude=custom["longitude"],
            timezone=custom.get("timezone", "auto")
        )
    return get_weather_and_tide_info(area=area, hotel_id=hotel_id or "taj-fort-aguada")
