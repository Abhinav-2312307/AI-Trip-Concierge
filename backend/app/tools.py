import json
import os
import math
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

GOA_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "goa.json")
HOTELS_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "hotels.json")

def load_data() -> Dict[str, Any]:
    with open(GOA_DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def load_hotels_raw() -> List[Dict[str, Any]]:
    if os.path.exists(HOTELS_DATA_PATH):
        try:
            with open(HOTELS_DATA_PATH, "r", encoding="utf-8") as f:
                hotels = json.load(f)
                if isinstance(hotels, list) and len(hotels) > 0:
                    return hotels
        except Exception:
            pass
    data = load_data()
    return data.get("hotels", [])

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates in kilometers using Haversine formula."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

def get_hotels(
    search: Optional[str] = None,
    region: Optional[str] = None,
    area: Optional[str] = None,
    max_price: Optional[float] = None
) -> List[Dict[str, Any]]:
    """Retrieve all verified Goa hotels and demo reservations with dynamic calendar dates and filters."""
    raw_hotels = load_hotels_raw()
    today = datetime.now().date()
    
    enriched_hotels = []
    for idx, hotel in enumerate(raw_hotels):
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

    filtered = enriched_hotels

    if search and search.strip():
        s = search.strip().lower()
        filtered = [
            h for h in filtered
            if s in h.get("name", "").lower()
            or s in h.get("area", "").lower()
            or s in h.get("region", "").lower()
            or s in h.get("description", "").lower()
            or any(s in a.lower() for a in h.get("amenities", []))
            or any(s in r.get("name", "").lower() for r in h.get("rooms", []))
        ]

    if region and region.strip() and region.lower() != "all" and region.lower() != "all goa":
        r_clean = region.strip().lower()
        filtered = [h for h in filtered if r_clean in h.get("region", "").lower()]

    if area and area.strip() and area.lower() != "all" and area.lower() != "all localities":
        a_clean = area.strip().lower()
        filtered = [h for h in filtered if a_clean in h.get("area", "").lower()]

    if max_price is not None and max_price > 0:
        filtered = [h for h in filtered if h.get("startingPrice", 0) <= max_price]

    return filtered

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

def _resolve_distance(place: Dict[str, Any], hotel_id: str, user_lat: Optional[float] = None, user_lng: Optional[float] = None) -> str:
    """Resolve realistic distance string from place to user or active hotel."""
    # 1. Live GPS distance calculation if user coordinates are provided
    if user_lat is not None and user_lng is not None:
        p_lat = place.get("latitude") or (place.get("coordinates", {}).get("lat"))
        p_lng = place.get("longitude") or (place.get("coordinates", {}).get("lng"))
        if p_lat is not None and p_lng is not None:
            dist_km = haversine_distance(user_lat, user_lng, p_lat, p_lng)
            mins = max(2, int(dist_km * 2.2))
            if dist_km < 1.0:
                return f"{int(dist_km * 1000)}m (~{mins} mins walk - Near You)"
            elif dist_km < 3.0:
                return f"{dist_km} km (~{mins} mins - Near You)"
            return f"{dist_km} km (~{mins} mins)"

    # 2. Check predefined distance map
    dist_map = place.get("distance_map", {})
    if hotel_id in dist_map:
        return dist_map[hotel_id]
    
    # 3. Compute Haversine distance between hotel and place
    h_info = get_hotel_info(hotel_id)
    h_lat = h_info.get("latitude") or (h_info.get("coordinates", {}).get("lat"))
    h_lng = h_info.get("longitude") or (h_info.get("coordinates", {}).get("lng"))
    p_lat = place.get("latitude") or (place.get("coordinates", {}).get("lat"))
    p_lng = place.get("longitude") or (place.get("coordinates", {}).get("lng"))

    if h_lat and h_lng and p_lat and p_lng:
        dist_km = haversine_distance(h_lat, h_lng, p_lat, p_lng)
        mins = max(2, int(dist_km * 2.2))
        if dist_km < 1.0:
            return f"{int(dist_km * 1000)}m (~{mins} mins - Near Hotel)"
        elif dist_km < 3.5:
            return f"{dist_km} km (~{mins} mins - Near Hotel)"
        return f"{dist_km} km (~{mins} mins)"
    
    # 4. Fallback to general distance_from_hotel if present
    if "distance_from_hotel" in place:
        return place["distance_from_hotel"]
    
    # 5. Area based fallback
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
    near_hotel: bool = False,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None
) -> List[Dict[str, Any]]:
    """Search authentic Goa restaurants relative to hotel or user coordinates."""
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
        r_item["distance_from_hotel"] = _resolve_distance(r, active_h_id, user_lat=user_lat, user_lng=user_lng)

        score = 0
        r_name = r.get("name", "").lower()
        r_area = r.get("area", "").lower()
        r_cuisine = r.get("cuisine", "").lower()
        r_vibe = r.get("vibe", "").lower()
        r_tags = [t.lower() for t in r.get("tags", [])]
        r_desc = r.get("description", "").lower()
        r_dist = r_item["distance_from_hotel"].lower()

        if near_hotel or (user_lat is not None and user_lng is not None):
            if "near" in r_dist or "doorstep" in r_dist or "at hotel" in r_dist:
                score += 10
            elif any(hw in r_area for hw in hotel_area_keywords):
                score += 6
            elif "km" in r_dist and any(f"{n} km" in r_dist or f"{n}." in r_dist for n in range(1, 8)):
                score += 5

        if area_lower:
            if area_lower in r_area or area_lower in r.get("region", "").lower():
                score += 6

        if cuisine_lower:
            if cuisine_lower in r_cuisine:
                score += 5
            elif any(cuisine_lower in t for t in r_tags):
                score += 4

        if vibe_lower:
            if vibe_lower in r_vibe or any(vibe_lower in t for t in r_tags):
                score += 4

        if query_lower:
            if query_lower in r_name:
                score += 7
            elif query_lower in r_cuisine or query_lower in r_area:
                score += 5
            elif query_lower in r_desc or any(query_lower in t for t in r_tags):
                score += 3

        if not (query_lower or area_lower or cuisine_lower or vibe_lower or near_hotel):
            if "near" in r_dist or "doorstep" in r_dist:
                score = 4
            else:
                score = 1

        if score > 0:
            results.append((score, r_item))

    results.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in results] if results else [
        {**r, "distance_from_hotel": _resolve_distance(r, active_h_id, user_lat=user_lat, user_lng=user_lng)} for r in restaurants[:4]
    ]

def search_activities(
    hotel_id: Optional[str] = "taj-fort-aguada",
    query: str = "",
    area: str = "",
    category: str = "",
    time_of_day: str = "",
    tags: Optional[List[str]] = None,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None
) -> List[Dict[str, Any]]:
    """Search beaches, cultural attractions, nightlife, and activities in Goa."""
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
        p_item["distance_from_hotel"] = _resolve_distance(p, active_h_id, user_lat=user_lat, user_lng=user_lng)

        score = 0
        p_name = p.get("name", "").lower()
        p_area = p.get("area", "").lower()
        p_desc = p.get("description", "").lower()
        p_tags = [t.lower() for t in p.get("tags", [])]
        p_best = p.get("best_time", "").lower()
        p_dist = p_item["distance_from_hotel"].lower()

        if "near" in p_dist or "doorstep" in p_dist or "at hotel" in p_dist:
            score += 5

        if area_lower:
            if area_lower in p_area or area_lower in p.get("region", "").lower():
                score += 6

        if time_lower:
            if time_lower in p_best or time_lower in p_desc:
                score += 4

        if tags:
            for t in tags:
                if t.lower() in p_tags:
                    score += 3

        if query_lower:
            if query_lower in p_name:
                score += 7
            elif query_lower in p_area or query_lower in p.get("category", ""):
                score += 5
            elif query_lower in p_desc or any(query_lower in t for t in p_tags):
                score += 3

        if not (query_lower or area_lower or cat_lower or time_lower or tags):
            score = 1

        if score > 0:
            results.append((score, p_item))

    results.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in results] if results else [
        {**p, "distance_from_hotel": _resolve_distance(p, active_h_id, user_lat=user_lat, user_lng=user_lng)} for p in places[:4]
    ]

def search_nearby_places(
    hotel_id: Optional[str] = "taj-fort-aguada",
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    category: Optional[str] = None,
    query: Optional[str] = None,
    radius_km: Optional[float] = None,
    limit: int = 6
) -> List[Dict[str, Any]]:
    """Retrieve places sorted strictly by distance from user GPS coordinates or active hotel."""
    data = load_data()
    places = data.get("places", [])
    active_h_id = hotel_id or "taj-fort-aguada"
    active_hotel = get_hotel_info(active_h_id)

    actual_lat = user_lat if user_lat is not None else lat
    actual_lng = user_lng if user_lng is not None else lng

    ref_lat = actual_lat if actual_lat is not None else active_hotel.get("latitude", 15.4952)
    ref_lng = actual_lng if actual_lng is not None else active_hotel.get("longitude", 73.7667)

    computed = []
    for p in places:
        if category and category.lower() != "all" and p.get("category") != category.lower():
            continue
        if query and query.strip():
            q = query.strip().lower()
            if not (q in p.get("name", "").lower() or q in p.get("area", "").lower() or q in p.get("description", "").lower() or any(q in t.lower() for t in p.get("tags", []))):
                continue

        p_lat = p.get("latitude") or p.get("coordinates", {}).get("lat", 15.4952)
        p_lng = p.get("longitude") or p.get("coordinates", {}).get("lng", 73.7667)
        dist_km = haversine_distance(ref_lat, ref_lng, p_lat, p_lng)

        if radius_km is not None and dist_km > radius_km:
            continue

        p_copy = dict(p)
        p_copy["distance_km"] = round(dist_km, 2)
        mins = max(2, int(dist_km * 2.2))
        origin_label = "You" if (actual_lat is not None and actual_lng is not None) else "Hotel"
        if dist_km < 1.0:
            p_copy["distance_from_hotel"] = f"{int(dist_km * 1000)}m (~{mins} mins - Near {origin_label})"
        elif dist_km < 3.5:
            p_copy["distance_from_hotel"] = f"{round(dist_km, 1)} km (~{mins} mins - Near {origin_label})"
        else:
            p_copy["distance_from_hotel"] = f"{round(dist_km, 1)} km (~{mins} mins)"
        
        computed.append((dist_km, p_copy))

    computed.sort(key=lambda x: x[0])
    return [item[1] for item in computed[:limit]]

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
    elif "majorda" in area_lower or "utorda" in area_lower or "arossim" in area_lower or "cansaulim" in area_lower:
        sea_cond = "Mild Surf (Flags: Green at Majorda, Utorda & Arossim)"
        forecast = "Pleasant coastal breeze with gentle sunset haze and optimal beach dining"
    elif "vagator" in area_lower or "anjuna" in area_lower:
        sea_cond = "Moderate Swell (Caution around Little Vagator & Anjuna Rocky Outcrops)"
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
        "name": "search_nearby_places",
        "description": "Discover places closest to the user's current GPS location or booked hotel in Goa, sorted by distance.",
        "input_schema": {
            "type": "object",
            "properties": {
                "category": {"type": "string", "description": "Filter by restaurant, beach, culture, nightlife, or activity"},
                "query": {"type": "string", "description": "Optional search term"}
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

def execute_tool(
    name: str,
    args: Dict[str, Any],
    hotel_id: str = "taj-fort-aguada",
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None
) -> Any:
    """Execute the matching tool function with given arguments, hotel context, and optional live GPS coordinates."""
    if name == "search_restaurants":
        return search_restaurants(
            hotel_id=hotel_id,
            query=args.get("query", ""),
            area=args.get("area", ""),
            cuisine=args.get("cuisine", ""),
            price_range=args.get("price_range", ""),
            vibe=args.get("vibe", ""),
            near_hotel=args.get("near_hotel", False),
            user_lat=user_lat,
            user_lng=user_lng
        )
    elif name == "search_activities":
        return search_activities(
            hotel_id=hotel_id,
            query=args.get("query", ""),
            area=args.get("area", ""),
            category=args.get("category", ""),
            time_of_day=args.get("time_of_day", ""),
            user_lat=user_lat,
            user_lng=user_lng
        )
    elif name == "search_nearby_places":
        return search_nearby_places(
            hotel_id=hotel_id,
            user_lat=user_lat,
            user_lng=user_lng,
            category=args.get("category"),
            query=args.get("query"),
            limit=args.get("limit", 6)
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
