import os
import logging
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .tools import (
    load_data,
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
    version="1.0.0"
)

# Enable CORS for local Vite dev server and any host
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from datetime import datetime, timedelta

# Pydantic Request Models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., description="User message to the concierge")
    history: Optional[List[ChatMessage]] = Field(default=[], description="Previous conversation turns")
    guest_name: Optional[str] = Field(default=None, description="Active guest name if provided")

class ItineraryRequest(BaseModel):
    days: int = Field(default=3, ge=1, le=5, description="Number of days for the itinerary (1-5)")
    focus: Optional[str] = Field(default="balanced", description="Theme focus: balanced, beaches, culture, nightlife")
    guest_name: Optional[str] = Field(default=None, description="Active guest name if provided")
    start_date: Optional[str] = Field(default=None, description="Trip start date (YYYY-MM-DD)")

class AlertSimulateRequest(BaseModel):
    alert_type: Optional[str] = Field(default="rain_baga", description="Type of alert to simulate: rain_baga, checkin_reminder, sunset_countdown, high_tide")


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "AI Trip Concierge Backend",
        "version": "1.0.0",
        "llm_provider": "Anthropic Claude SDK (Tool-Calling Engine Enabled)"
    }


@app.get("/api/trip-context")
def get_trip_context():
    """Retrieve full trip context, demo hotel booking details, and guest profile with dynamic dates."""
    data = load_data()
    hotel = data.get("hotel", {})
    weather = get_weather_and_tide_info("Candolim")
    alerts = get_active_alerts()
    
    # Compute dynamic dates from active system date
    today = datetime.now().date()
    check_in_date = today + timedelta(days=1)
    check_out_date = check_in_date + timedelta(days=3)
    days_until = (check_in_date - today).days

    return {
        "hotel": hotel,
        "destination": "Goa, India",
        "stay": f"{hotel.get('name')} ({hotel.get('area')})",
        "guest_name": hotel.get("guest_name", ""),
        "room_type": hotel.get("room_type", "Sea View Luxury Suite"),
        "confirmation_code": hotel.get("confirmation_code", "TAJ-GOA-89421"),
        "current_date": today.strftime("%Y-%m-%d"),
        "current_date_formatted": today.strftime("%A, %b %d, %Y"),
        "check_in": check_in_date.strftime("%Y-%m-%d"),
        "check_in_formatted": check_in_date.strftime("%b %d, %Y"),
        "check_out": check_out_date.strftime("%Y-%m-%d"),
        "check_out_formatted": check_out_date.strftime("%b %d, %Y"),
        "duration": "3 Nights / 4 Days",
        "days_until_checkin": days_until,
        "weather_summary": weather,
        "active_alerts_count": len(alerts)
    }


@app.post("/api/chat")
def chat_with_concierge(req: ChatRequest):
    """Conversational endpoint interacting with the AI agent via tool-calling."""
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    
    history_dicts = [{"role": m.role, "content": m.content} for m in req.history] if req.history else []
    
    try:
        response = agent_instance.chat(req.message, history_dicts, guest_name=req.guest_name)
        return response
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI Agent error: {str(e)}")


@app.post("/api/itinerary/generate")
def create_itinerary(req: ItineraryRequest):
    """Generate a multi-day itinerary based on the Goa knowledge base."""
    return generate_itinerary(
        days=req.days,
        focus=req.focus or "balanced",
        guest_name=req.guest_name,
        start_date=req.start_date
    )


@app.get("/api/recommendations")
def list_recommendations(
    category: Optional[str] = Query(None, description="Category: restaurant, beach, culture, nightlife, activity, or all"),
    area: Optional[str] = Query(None, description="Filter by area e.g. Candolim, Anjuna, Panjim"),
    search: Optional[str] = Query(None, description="Keyword search")
):
    """Get places matching filters."""
    data = load_data()
    places = data.get("places", [])
    
    filtered = places
    if category and category.lower() != "all":
        cat_lower = category.lower()
        filtered = [p for p in filtered if p.get("category", "").lower() == cat_lower]
        
    if area:
        area_lower = area.lower()
        filtered = [p for p in filtered if area_lower in p.get("area", "").lower() or area_lower in p.get("region", "").lower()]
        
    if search:
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
def get_place(place_id: str):
    """Get single place detail."""
    place = get_place_details(place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found in Goa knowledge base")
    return place


@app.get("/api/alerts")
def get_alerts():
    """Retrieve simulated proactive alerts."""
    return {
        "alerts": get_active_alerts()
    }


@app.post("/api/alerts/simulate")
def trigger_alert_simulation(req: AlertSimulateRequest):
    """Simulate a live proactive alert event for testing/demo."""
    alert = simulate_alert(req.alert_type or "rain_baga")
    return {
        "status": "success",
        "alert": alert
    }


@app.get("/api/transport-guide")
def get_transport():
    """Retrieve Goa transportation options and tips."""
    return {
        "guide": get_transport_tips()
    }


@app.get("/api/weather")
def get_weather():
    """Retrieve current coastal weather and tide conditions."""
    return get_weather_and_tide_info("Candolim")
