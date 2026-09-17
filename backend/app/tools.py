import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "goa.json")

def load_data() -> Dict[str, Any]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def get_hotels() -> List[Dict[str, Any]]:
    """Retrieve all available verified Goa hotels and demo reservations with dynamic calendar dates."""
    data = load_data()
    hotels = data.get("hotels", [])
    today = datetime.now().date()
    
    # Enrich each hotel booking with dynamic dates and formatting
    enriched_hotels = []
    for idx, hotel in enumerate(hotels):
        # Slightly staggered check-in dates for realism
        check_in_offset = 1 if idx == 0 else (idx + 1)
        check_in_date = today + timedelta(days=check_in_offset)
        check_out_date = check_in_date + timedelta(days=3)
        days_until = (check_in_date - today).days

        h_copy = dict(hotel)
        h_copy.update({
            "check_in": check_in_date.strftime("%Y-%m-%d"),
            "check_in_formatted": check_in_date.strftime("%b %d, %Y"),
            "check_out": check_out_date.strftime("%Y-%m-%d"),
            "check_out_formatted": check_out_date.strftime("%b %d, %Y"),
            "duration": "3 Nights / 4 Days",
            "days_until_checkin": days_until,
            "status": "Confirmed Sample Reservation"
        })
        enriched_hotels.append(h_copy)
    return enriched_hotels

def get_hotel_info(hotel_id: Optional[str] = None) -> Dict[str, Any]:
    """Retrieve hotel details for a specific hotel ID or default to Taj Fort Aguada."""
    hotels = get_hotels()
    if not hotel_id:
        return hotels[0] if hotels else {}
    
    clean_id = hotel_id.strip().lower()
    for h in hotels:
        if h.get("id", "").lower() == clean_id:
            return h
    return hotels[0] if hotels else {}

def _resolve_distance(place: Dict[str, Any], hotel_id: str) -> str:
    """Resolve realistic distance string from the place's distance_map relative to the active hotel."""
    dist_map = place.get("distance_map", {})
    if hotel_id in dist_map:
        return dist_map[hotel_id]
    
    # Fallback to general distance_from_hotel if present
    if "distance_from_hotel" in place:
        return place["distance_from_hotel"]
    
    # Area based fallback
    h_info = get_hotel_info(hotel_id)
    h_area = h_info.get("area", "").lower()
    p_area = place.get("area", "").lower()
    if p_area in h_area or h_area in p_area:
        return "1 - 2 km (~5 mins - Near Hotel)"
    return "10 - 25 km (~25-45 mins)"

def search_restaurants(
    hotel_id: Optional[str] = "taj-fort-aguada",
    query: str = "",
    area: str = "",
    cuisine: str = "",
    price_range: str = "",
    vibe: str = "",
    near_hotel: bool = False
) -> List[Dict[str, Any]]:
    """Search authentic Goa restaurants in the knowledge base relative to the active hotel."""
    data = load_data()
    places = data.get("places", [])
    restaurants = [p for p in places if p.get("category") == "restaurant"]
    
    active_h_id = hotel_id or "taj-fort-aguada"
    active_hotel = get_hotel_info(active_h_id)
    hotel_area_keywords = [w.lower() for w in active_hotel.get("area", "").replace(",", " ").split() if len(w) > 3]

    results = []
    query_lower = query.lower() if query else ""
    area_lower = area.lower() if area else ""
    cuisine_lower = cuisine.lower() if cuisine else ""
    vibe_lower = vibe.lower() if vibe else ""

    for r in restaurants:
        r_item = dict(r)
        r_item["distance_from_hotel"] = _resolve_distance(r, active_h_id)

        score = 0
        r_name = r.get("name", "").lower()
        r_area = r.get("area", "").lower()
        r_cuisine = r.get("cuisine", "").lower()
        r_vibe = r.get("vibe", "").lower()
        r_tags = [t.lower() for t in r.get("tags", [])]
        r_desc = r.get("description", "").lower()
        r_dist = r_item["distance_from_hotel"].lower()

        if near_hotel:
            if "near hotel" in r_dist or "at hotel" in r_dist or "doorstep" in r_dist:
                score += 8
            elif any(hw in r_area for hw in hotel_area_keywords):
                score += 6
            elif "km" in r_dist and any(f"{n} km" in r_dist for n in range(1, 8)):
                score += 4

        if area_lower:
            if area_lower in r_area or area_lower in r.get("region", "").lower():
                score += 5

        if cuisine_lower:
            if cuisine_lower in r_cuisine:
                score += 4

        if vibe_lower:
            if vibe_lower in r_vibe or any(vibe_lower in t for t in r_tags):
                score += 3

        if query_lower:
            if query_lower in r_name:
                score += 6
            elif query_lower in r_cuisine or query_lower in r_area:
                score += 4
            elif query_lower in r_desc or any(query_lower in t for t in r_tags):
                score += 2

        if not (query_lower or area_lower or cuisine_lower or vibe_lower or near_hotel):
            # Prioritize nearby places when no strict filter
            if "near hotel" in r_dist or "at hotel" in r_dist:
                score = 3
            else:
                score = 1

        if score > 0:
            results.append((score, r_item))

    results.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in results] if results else [
        {**r, "distance_from_hotel": _resolve_distance(r, active_h_id)} for r in restaurants[:4]
    ]

def search_activities(
    hotel_id: Optional[str] = "taj-fort-aguada",
    query: str = "",
    area: str = "",
    category: str = "",
    time_of_day: str = "",
    tags: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """Search beaches, cultural attractions, nightlife, and activities in Goa relative to the active hotel."""
    data = load_data()
    places = data.get("places", [])
    active_h_id = hotel_id or "taj-fort-aguada"
    active_hotel = get_hotel_info(active_h_id)
    hotel_area_keywords = [w.lower() for w in active_hotel.get("area", "").replace(",", " ").split() if len(w) > 3]

    results = []
    query_lower = query.lower() if query else ""
    area_lower = area.lower() if area else ""
    cat_lower = category.lower() if category else ""
    time_lower = time_of_day.lower() if time_of_day else ""

    for p in places:
        if cat_lower and cat_lower != "all":
            if p.get("category") != cat_lower:
                continue

        p_item = dict(p)
        p_item["distance_from_hotel"] = _resolve_distance(p, active_h_id)

        score = 0
        p_name = p.get("name", "").lower()
        p_area = p.get("area", "").lower()
        p_desc = p.get("description", "").lower()
        p_tags = [t.lower() for t in p.get("tags", [])]
        p_best = p.get("best_time", "").lower()
        p_dist = p_item["distance_from_hotel"].lower()

        # Near hotel bonus
        if "near hotel" in p_dist or "at hotel" in p_dist or "doorstep" in p_dist:
            score += 4

        if area_lower:
            if area_lower in p_area or area_lower in p.get("region", "").lower():
                score += 5

        if time_lower:
            if time_lower in p_best or time_lower in p_desc:
                score += 3

        if tags:
            for t in tags:
                if t.lower() in p_tags:
                    score += 3

        if query_lower:
            if query_lower in p_name:
                score += 6
            elif query_lower in p_area or query_lower in p.get("category", ""):
                score += 4
            elif query_lower in p_desc or any(query_lower in t for t in p_tags):
                score += 2

        if not (query_lower or area_lower or cat_lower or time_lower or tags):
            score = 1

        if score > 0:
            results.append((score, p_item))

    results.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in results] if results else [
        {**p, "distance_from_hotel": _resolve_distance(p, active_h_id)} for p in places[:4]
    ]

def get_transport_tips(
    hotel_id: Optional[str] = "taj-fort-aguada",
    origin: Optional[str] = None,
    destination: str = "",
    mode: str = ""
) -> List[Dict[str, Any]]:
    """Get realistic Goa transport tips and fare estimates from active hotel."""
    data = load_data()
    guides = data.get("transport_guide", [])
    if not mode:
        return guides
    
    mode_lower = mode.lower()
    matched = [g for g in guides if mode_lower in g.get("type", "").lower() or mode_lower in g.get("best_for", "").lower()]
    return matched if matched else guides

def get_place_details(place_id_or_name: str, hotel_id: Optional[str] = "taj-fort-aguada") -> Optional[Dict[str, Any]]:
    """Retrieve full details for a specific place in Goa."""
    data = load_data()
    places = data.get("places", [])
    query = place_id_or_name.lower().strip()
    active_h_id = hotel_id or "taj-fort-aguada"
    
    for p in places:
        if p.get("id", "").lower() == query or query in p.get("name", "").lower():
            item = dict(p)
            item["distance_from_hotel"] = _resolve_distance(item, active_h_id)
            return item
    return None

def get_weather_and_tide_info(area: Optional[str] = None, hotel_id: Optional[str] = None) -> Dict[str, Any]:
    """Get simulated coastal weather, sea conditions, and sunset timing for the specific hotel's area."""
    if hotel_id:
        hotel = get_hotel_info(hotel_id)
        active_area = hotel.get("area", "Sinquerim, Candolim")
    else:
        active_area = area or "Sinquerim, Candolim"

    area_lower = active_area.lower()
    if "cavelossim" in area_lower or "mobor" in area_lower:
        sea_cond = "Calm South Goa Waters (Flags: Green at Mobor Beach)"
        forecast = "Clear evening skies over Sal River; perfect for sunset catamaran cruises"
    elif "majorda" in area_lower or "utorda" in area_lower:
        sea_cond = "Mild Surf (Flags: Green at Majorda & Utorda)"
        forecast = "Pleasant coastal breeze with gentle sunset haze"
    elif "vagator" in area_lower:
        sea_cond = "Moderate Swell (Caution around Little Vagator Rocky Outcrops)"
        forecast = "Vibrant clear golden hour over Chapora Fort and cliff decks"
    else:
        sea_cond = "Moderate Swell (Flags: Yellow at Sinquerim, Caution at Vagator Rocks)"
        forecast = "Isolated evening breeze; pleasant beach shack dining"

    return {
        "area": active_area,
        "temperature_c": 29,
        "condition": "Partly Cloudy with Coastal Breeze",
        "evening_forecast": forecast,
        "humidity": "74%",
        "sunset_time": "6:28 PM",
        "golden_hour_start": "5:45 PM",
        "sea_condition": sea_cond,
        "tide_schedule": {
            "low_tide": "11:15 AM",
            "high_tide": "5:40 PM"
        },
        "is_simulated_demo": True
    }

# Anthropic Tool definitions
CLAUDE_TOOLS = [
    {
        "name": "search_restaurants",
        "description": "Search authentic Goa restaurants in the knowledge base by area, cuisine, vibe, or proximity to guest's hotel. Returns verified venues with pricing, signature dishes, and distance from active hotel.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search keyword or dish name"},
                "area": {"type": "string", "description": "Goa locality (e.g. Candolim, Assagao, Vagator, Cavelossim, Majorda, Panjim)"},
                "cuisine": {"type": "string", "description": "Cuisine type (e.g. Goan Seafood, South Indian, Greek, Portuguese, Modern Goan)"},
                "vibe": {"type": "string", "description": "Atmosphere (e.g. romantic, sunset, beach shack, authentic thali, fine dining)"},
                "near_hotel": {"type": "boolean", "description": "Set to true if user asks for places 'near me' or near their hotel stay"}
            }
        }
    },
    {
        "name": "search_activities",
        "description": "Search beaches, cultural attractions, nightlife, viewpoints, and water sports in Goa relative to active hotel.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search keyword like 'chill beach', 'scuba', 'fort', 'sunset', 'kayak'"},
                "area": {"type": "string", "description": "Goa area (e.g. Sinquerim, Vagator, Mobor, Majorda, Anjuna, Old Goa, Panjim, Palolem)"},
                "category": {"type": "string", "enum": ["beach", "culture", "nightlife", "activity", "all"], "description": "Place category"},
                "time_of_day": {"type": "string", "description": "Morning, Afternoon, Sunset, or Night"}
            }
        }
    },
    {
        "name": "get_transport_tips",
        "description": "Get transportation advice, fare estimates (GoaMiles app cabs, scooter rentals, pilots), and travel directions in Goa.",
        "input_schema": {
            "type": "object",
            "properties": {
                "origin": {"type": "string", "description": "Starting point (defaults to guest's hotel)"},
                "destination": {"type": "string", "description": "Destination in Goa (e.g. Panjim, Baga, Palolem, Cabo de Rama)"},
                "mode": {"type": "string", "description": "Preferred mode (scooter, taxi, goa_miles, pilot, ferry)"}
            }
        }
    },
    {
        "name": "get_place_details",
        "description": "Retrieve comprehensive details for a specific Goa place by name or ID.",
        "input_schema": {
            "type": "object",
            "properties": {
                "place_id_or_name": {"type": "string", "description": "Name or ID of the place"}
            },
            "required": ["place_id_or_name"]
        }
    },
    {
        "name": "get_weather_and_tide_info",
        "description": "Get local coastal weather, sunset timing, tide schedule, and rain advisories in Goa for active hotel area.",
        "input_schema": {
            "type": "object",
            "properties": {
                "area": {"type": "string", "description": "Goa location"}
            }
        }
    }
]

def execute_tool(name: str, args: Dict[str, Any], hotel_id: str = "taj-fort-aguada") -> Any:
    """Execute the matching tool function with given arguments and hotel context."""
    if name == "search_restaurants":
        return search_restaurants(
            hotel_id=hotel_id,
            query=args.get("query", ""),
            area=args.get("area", ""),
            cuisine=args.get("cuisine", ""),
            price_range=args.get("price_range", ""),
            vibe=args.get("vibe", ""),
            near_hotel=args.get("near_hotel", False)
        )
    elif name == "search_activities":
        return search_activities(
            hotel_id=hotel_id,
            query=args.get("query", ""),
            area=args.get("area", ""),
            category=args.get("category", ""),
            time_of_day=args.get("time_of_day", "")
        )
    elif name == "get_transport_tips":
        h_info = get_hotel_info(hotel_id)
        default_origin = f"{h_info.get('name')}, {h_info.get('area')}"
        return get_transport_tips(
            hotel_id=hotel_id,
            origin=args.get("origin", default_origin),
            destination=args.get("destination", ""),
            mode=args.get("mode", "")
        )
    elif name == "get_place_details":
        return get_place_details(args.get("place_id_or_name", ""), hotel_id=hotel_id)
    elif name == "get_weather_and_tide_info":
        return get_weather_and_tide_info(area=args.get("area"), hotel_id=hotel_id)
    else:
        return {"error": f"Unknown tool: {name}"}
