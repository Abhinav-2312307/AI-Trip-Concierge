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

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_concierge.main")

app = FastAPI(
    title="AI Trip Concierge API",
    description="Post-Booking Travel Companion Backend for Hotel Guests in Goa",
    version="2.0.0"
)

# Enable CORS for local Vite dev server and any host
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Request Models
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
    alert_type: Optional[str] = Field(default="rain_baga", description="Type of alert to simulate: rain_baga, checkin_reminder, sunset_countdown, high_tide")


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "AI Trip Concierge Backend",
        "version": "2.0.0",
        "llm_provider": "Anthropic Claude SDK (Multi-Hotel Tool-Calling Engine Enabled)"
    }


@app.get("/api/hotels")
def list_hotel_bookings():
    """Retrieve all available verified Goa hotel bookings and sample demo reservations."""
    return {
        "count": len(get_hotels()),
        "hotels": get_hotels()
    }


@app.get("/api/trip-context")
def get_trip_context(hotel_id: Optional[str] = Query("taj-fort-aguada", description="Selected hotel booking ID")):
    """Retrieve full trip context, hotel booking details, and active conditions for the selected hotel."""
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
        "active_alerts_count": len(alerts)
    }


@app.post("/api/chat")
def chat_with_concierge(req: ChatRequest):
    """Conversational endpoint interacting with the AI agent grounded in the selected hotel context."""
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    
    history_dicts = [{"role": m.role, "content": m.content} for m in req.history] if req.history else []
    
    try:
        response = agent_instance.chat(
            req.message,
            history_dicts,
            guest_name=req.guest_name,
            hotel_id=req.hotel_id or "taj-fort-aguada"
        )
        return response
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI Agent error: {str(e)}")


@app.post("/api/itinerary/generate")
def create_itinerary(req: ItineraryRequest):
    """Generate a multi-day itinerary tailored specifically to the selected hotel booking."""
    return generate_itinerary(
        hotel_id=req.hotel_id or "taj-fort-aguada",
        days=req.days,
        focus=req.focus or "balanced",
        guest_name=req.guest_name,
        start_date=req.start_date
    )


@app.get("/api/recommendations")
def list_recommendations(
    hotel_id: Optional[str] = Query(default="taj-fort-aguada", description="Active hotel ID"),
    category: Optional[str] = Query(default=None, description="Category: restaurant, beach, culture, nightlife, activity, or all"),
    area: Optional[str] = Query(default=None, description="Filter by area e.g. Candolim, Anjuna, Panjim, Mobor"),
    search: Optional[str] = Query(default=None, description="Keyword search")
):
    """Get places matching filters with distance calculated relative to the active hotel."""
    active_h_id = hotel_id if isinstance(hotel_id, str) else "taj-fort-aguada"
    data = load_data()
    places = data.get("places", [])
    
    from .tools import _resolve_distance

    # Attach computed distance
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
        raise HTTPException(status_code=404, detail="Place not found in Goa knowledge base")
    return place


@app.get("/api/alerts")
def get_alerts(hotel_id: Optional[str] = Query("taj-fort-aguada", description="Active hotel ID")):
    """Retrieve simulated proactive alerts customized for the selected hotel."""
    return {
        "alerts": get_active_alerts(hotel_id=hotel_id or "taj-fort-aguada")
    }


@app.post("/api/alerts/simulate")
def trigger_alert_simulation(req: AlertSimulateRequest):
    """Simulate a live proactive alert event tied to the selected hotel for testing/demo."""
    alert = simulate_alert(hotel_id=req.hotel_id or "taj-fort-aguada", alert_type=req.alert_type or "rain_baga")
    return {
        "status": "success",
        "alert": alert
    }


@app.get("/api/transport-guide")
def get_transport(hotel_id: Optional[str] = Query("taj-fort-aguada")):
    """Retrieve Goa transportation options and tips from active hotel."""
    return {
        "guide": get_transport_tips(hotel_id=hotel_id or "taj-fort-aguada")
    }


@app.get("/api/weather")
def get_weather(
    hotel_id: Optional[str] = Query("taj-fort-aguada"),
    area: Optional[str] = Query(None)
):
    """Retrieve coastal weather and tide conditions for active hotel."""
    return get_weather_and_tide_info(area=area, hotel_id=hotel_id or "taj-fort-aguada")
