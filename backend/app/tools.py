import json
import os
from typing import List, Dict, Any, Optional

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "goa.json")

def load_data() -> Dict[str, Any]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def get_hotel_info() -> Dict[str, Any]:
    data = load_data()
    return data.get("hotel", {})

def search_restaurants(
    query: str = "",
    area: str = "",
    cuisine: str = "",
    price_range: str = "",
    vibe: str = "",
    near_hotel: bool = False
) -> List[Dict[str, Any]]:
    """Search authentic Goa restaurants in the knowledge base."""
    data = load_data()
    places = data.get("places", [])
    restaurants = [p for p in places if p.get("category") == "restaurant"]
    
    results = []
    query_lower = query.lower() if query else ""
    area_lower = area.lower() if area else ""
    cuisine_lower = cuisine.lower() if cuisine else ""
    vibe_lower = vibe.lower() if vibe else ""

    for r in restaurants:
        score = 0
        r_name = r.get("name", "").lower()
        r_area = r.get("area", "").lower()
        r_cuisine = r.get("cuisine", "").lower()
        r_vibe = r.get("vibe", "").lower()
        r_tags = [t.lower() for t in r.get("tags", [])]
        r_desc = r.get("description", "").lower()

        if near_hotel:
            if "near hotel" in r_tags or r_area in ["candolim", "sinquerim", "calangute"]:
                score += 5
            elif "km" in r.get("distance_from_hotel", "") and float(r.get("distance_from_hotel", "100").split("km")[0].strip()) <= 7:
                score += 3

        if area_lower:
            if area_lower in r_area or area_lower in r.get("region", "").lower():
                score += 4

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

        # If no strict filter was set, all restaurants match with base score
        if not (query_lower or area_lower or cuisine_lower or vibe_lower or near_hotel):
            score = 1

        if score > 0:
            results.append((score, r))

    results.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in results] if results else restaurants[:4]


def search_activities(
    query: str = "",
    area: str = "",
    category: str = "",
    time_of_day: str = "",
    tags: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """Search beaches, cultural attractions, nightlife, and activities in Goa."""
    data = load_data()
    places = data.get("places", [])
    
    results = []
    query_lower = query.lower() if query else ""
    area_lower = area.lower() if area else ""
    cat_lower = category.lower() if category else ""
    time_lower = time_of_day.lower() if time_of_day else ""

    for p in places:
        # Match category if specified (e.g. beach, culture, nightlife, activity)
        if cat_lower and cat_lower != "all":
            if p.get("category") != cat_lower:
                continue

        score = 0
        p_name = p.get("name", "").lower()
        p_area = p.get("area", "").lower()
        p_desc = p.get("description", "").lower()
        p_tags = [t.lower() for t in p.get("tags", [])]
        p_best = p.get("best_time", "").lower()

        if area_lower:
            if area_lower in p_area or area_lower in p.get("region", "").lower():
                score += 4

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
            results.append((score, p))

    results.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in results] if results else places[:4]


def get_transport_tips(
    origin: str = "Taj Fort Aguada, Candolim",
    destination: str = "",
    mode: str = ""
) -> List[Dict[str, Any]]:
    """Get realistic Goa transport tips, price estimates, and safety advisories."""
    data = load_data()
    guides = data.get("transport_guide", [])
    
    if not mode:
        return guides
    
    mode_lower = mode.lower()
    matched = [g for g in guides if mode_lower in g.get("type", "").lower() or mode_lower in g.get("best_for", "").lower()]
    return matched if matched else guides


def get_place_details(place_id_or_name: str) -> Optional[Dict[str, Any]]:
    """Retrieve full details for a specific place in Goa."""
    data = load_data()
    places = data.get("places", [])
    query = place_id_or_name.lower().strip()
    
    for p in places:
        if p.get("id", "").lower() == query or query in p.get("name", "").lower():
            return p
    return None


def get_weather_and_tide_info(area: str = "Candolim") -> Dict[str, Any]:
    """Get simulated weather, sea conditions, and sunset time for Goa."""
    return {
        "area": area,
        "temperature_c": 29,
        "condition": "Partly Cloudy with Coastal Breeze",
        "evening_forecast": "Isolated evening showers expected around Baga & Calangute after 6:00 PM",
        "humidity": "76%",
        "sunset_time": "6:28 PM",
        "golden_hour_start": "5:45 PM",
        "sea_condition": "Moderate Swell (Flags: Yellow at Sinquerim, Caution at Vagator Rocks)",
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
        "description": "Search authentic Goa restaurants in the knowledge base by area, cuisine, vibe, or proximity to guest's hotel (Taj Fort Aguada, Candolim). Returns verified venues with pricing, signature dishes, and distance.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search keyword or dish name"},
                "area": {"type": "string", "description": "Goa locality (e.g. Candolim, Assagao, Baga, Siolim, Calangute, Panjim)"},
                "cuisine": {"type": "string", "description": "Cuisine type (e.g. Goan Seafood, South Indian, Greek, Portuguese)"},
                "vibe": {"type": "string", "description": "Atmosphere (e.g. romantic, sunset, beach shack, authentic thali)"},
                "near_hotel": {"type": "boolean", "description": "Set to true if user asks for places 'near me' or near the hotel"}
            }
        }
    },
    {
        "name": "search_activities",
        "description": "Search beaches, cultural attractions, nightlife, viewpoints, and water sports in Goa. Returns verified places from knowledge base.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search keyword like 'chill beach', 'scuba', 'fort', 'sunset'"},
                "area": {"type": "string", "description": "Goa area (e.g. Anjuna, Vagator, Ashvem, Sinquerim, Old Goa, Panjim, Palolem)"},
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
                "origin": {"type": "string", "description": "Starting point (default is Taj Fort Aguada, Candolim)"},
                "destination": {"type": "string", "description": "Destination in Goa (e.g. Panjim, Baga, Palolem)"},
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
        "description": "Get local coastal weather, sunset timing, tide schedule, and rain advisories in Goa.",
        "input_schema": {
            "type": "object",
            "properties": {
                "area": {"type": "string", "description": "Goa location"}
            }
        }
    }
]

def execute_tool(name: str, args: Dict[str, Any]) -> Any:
    """Execute the matching tool function with given arguments."""
    if name == "search_restaurants":
        return search_restaurants(
            query=args.get("query", ""),
            area=args.get("area", ""),
            cuisine=args.get("cuisine", ""),
            price_range=args.get("price_range", ""),
            vibe=args.get("vibe", ""),
            near_hotel=args.get("near_hotel", False)
        )
    elif name == "search_activities":
        return search_activities(
            query=args.get("query", ""),
            area=args.get("area", ""),
            category=args.get("category", ""),
            time_of_day=args.get("time_of_day", "")
        )
    elif name == "get_transport_tips":
        return get_transport_tips(
            origin=args.get("origin", "Taj Fort Aguada, Candolim"),
            destination=args.get("destination", ""),
            mode=args.get("mode", "")
        )
    elif name == "get_place_details":
        return get_place_details(args.get("place_id_or_name", ""))
    elif name == "get_weather_and_tide_info":
        return get_weather_and_tide_info(args.get("area", "Candolim"))
    else:
        return {"error": f"Unknown tool: {name}"}
