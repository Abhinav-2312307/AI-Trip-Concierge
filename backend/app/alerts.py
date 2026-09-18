from typing import List, Dict, Any, Optional
from datetime import datetime
from .tools import load_data, get_hotel_info

def get_active_alerts(hotel_id: Optional[str] = "taj-fort-aguada", custom_trip: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """Retrieve proactive alerts dynamically customized for the active hotel booking."""
    alerts = []

    # 1. Custom Trip Alerts (Real Weather Data)
    if custom_trip:
        hotel_name = custom_trip.get("hotel_name", "My Hotel")
        dest_short = custom_trip.get("destination_short", "your destination")
        check_in = custom_trip.get("check_in", "")
        weather = custom_trip.get("weather", {})

        # Digital Check-in Key & Welcome Pass Alert
        alerts.append({
            "id": f"alert-checkin-custom",
            "type": "concierge",
            "severity": "info",
            "icon": "🔑",
            "title": f"Welcome to {hotel_name}",
            "message": f"🏨 Your room at {hotel_name} is prepared with personalized welcome refreshments. Concierge services are active for {dest_short}.",
            "recommended_action": f"Ask Concierge for check-in details",
            "timestamp": "9:00 AM"
        })

        # Weather / Rain Alert
        precip_prob = weather.get("precipitation_probability", 0)
        condition = weather.get("condition", "Unknown").lower()

        if precip_prob > 40 or "rain" in condition or "shower" in condition:
            alerts.append({
                "id": f"alert-weather-custom",
                "type": "weather",
                "severity": "warning",
                "icon": "🌧️",
                "title": f"Rain Advisory - {dest_short}",
                "message": f"🌧️ Heads up — {condition} expected in {dest_short}. There is a {precip_prob}% chance of precipitation. Consider planning indoor activities or early sightseeing.",
                "recommended_action": "Ask Concierge for indoor recommendations",
                "timestamp": "2:00 PM"
            })
        elif "clear" in condition or "sun" in condition or "fair" in condition:
             alerts.append({
                "id": f"alert-weather-custom",
                "type": "weather",
                "severity": "tip",
                "icon": "☀️",
                "title": f"Clear Skies over {dest_short}",
                "message": f"☀️ Beautiful clear weather conditions today in {dest_short}. It's a perfect day for outdoor sightseeing and exploration.",
                "recommended_action": "Ask Concierge for outdoor activities",
                "timestamp": "10:00 AM"
            })

        # Golden Hour Experience Countdown
        sunset = weather.get("sunset_time", "")
        if sunset:
            alerts.append({
                "id": f"alert-sunset-custom",
                "type": "experience",
                "severity": "tip",
                "icon": "🌅",
                "title": f"Golden Hour Countdown - {dest_short}",
                "message": f"🌅 Sunset in {dest_short} today is at {sunset}. Peak golden light begins about 45 minutes before. Secure prime sunset viewing spots soon!",
                "recommended_action": "Ask Concierge for sunset viewing spots",
                "timestamp": "4:00 PM"
            })

        return alerts

    # 2. Goa Demo Mode Alerts
    active_h_id = hotel_id or "taj-fort-aguada"
    hotel = get_hotel_info(active_h_id)
    hotel_name = hotel.get("name", "Taj Fort Aguada")
    hotel_area = hotel.get("area", "Sinquerim, Candolim")
    room_type = hotel.get("room_type", "Luxury Suite")
    conf_code = hotel.get("confirmation_code", "CONF-DEMO")
    check_in_time = hotel.get("check_in_time", "3:00 PM")

    # Digital Check-in Key & Welcome Pass Alert
    alerts.append({
        "id": f"alert-checkin-{active_h_id}",
        "type": "concierge",
        "severity": "info",
        "icon": "🔑",
        "title": f"Welcome to {hotel_name}",
        "message": f"🏨 Your {room_type} (Booking: {conf_code}) is prepared with personalized welcome refreshments. Digital room key & check-in pass (starts {check_in_time}) are active.",
        "recommended_action": f"View {hotel_name} amenities & concierge services",
        "action_payload": {"type": "hotel_info", "hotel_id": active_h_id},
        "timestamp": "9:00 AM"
    })

    # Area Weather / Rain Alert
    if "cavelossim" in hotel_area.lower() or "mobor" in hotel_area.lower():
        alerts.append({
            "id": f"alert-weather-{active_h_id}",
            "type": "weather",
            "severity": "tip",
            "icon": "⛵",
            "title": "Clear Evening Skies over River Sal & Mobor",
            "message": "🌅 Gentle coastal breeze and clear skies forecast along Cavelossim and River Sal after 5:00 PM. Ideal conditions for a sunset boat cruise or outdoor dining at Fisherman's Wharf.",
            "recommended_action": "Explore River Sal Catamaran & Mobor Dining",
            "action_payload": {"type": "view_place", "id": "fishermans-wharf-mobor"},
            "timestamp": "11:30 AM"
        })
    elif "majorda" in hotel_area.lower() or "utorda" in hotel_area.lower():
        alerts.append({
            "id": f"alert-weather-{active_h_id}",
            "type": "weather",
            "severity": "tip",
            "icon": "🌴",
            "title": "Sunset Advisory - Utorda & Majorda Sands",
            "message": "🌴 Beautiful golden hour conditions on Majorda and Utorda beaches today. Low tide at 4:30 PM makes it perfect for a long barefoot sunset beach walk.",
            "recommended_action": "Check Zeebop by the Sea Sunset Booking",
            "action_payload": {"type": "view_place", "id": "zeebop-by-the-sea"},
            "timestamp": "12:00 PM"
        })
    elif "vagator" in hotel_area.lower():
        alerts.append({
            "id": f"alert-weather-{active_h_id}",
            "type": "weather",
            "severity": "warning",
            "icon": "🌊",
            "title": "High Tide Advisory - Little Vagator Rocks",
            "message": "🌊 High tide warning along Little Vagator and Ozran rocky shorelines between 4:00 PM and 7:00 PM. Please enjoy sunset views safely from cliff decks like Chapora Fort or W Rockpool.",
            "recommended_action": "View Chapora Fort Sunset Spot",
            "action_payload": {"type": "view_place", "id": "chapora-fort"},
            "timestamp": "1:15 PM"
        })
    else:
        alerts.append({
            "id": f"alert-weather-{active_h_id}",
            "type": "weather",
            "severity": "warning",
            "icon": "🌧️",
            "title": "Evening Rain Advisory - Baga & Calangute",
            "message": "🌧️ Heads up — isolated rain showers expected in Calangute and Baga after 6:00 PM today. Consider planning an indoor dining experience like Gunpowder Assagao or an earlier beach visit to Sinquerim.",
            "recommended_action": "Switch to indoor dining / visit Fontainhas Latin Quarter",
            "action_payload": {"type": "view_place", "id": "gunpowder-assagao"},
            "timestamp": "2:00 PM"
        })

    # Golden Hour Experience Countdown
    if "cavelossim" in hotel_area.lower() or "mobor" in hotel_area.lower():
        alerts.append({
            "id": f"alert-sunset-{active_h_id}",
            "type": "experience",
            "severity": "tip",
            "icon": "🌅",
            "title": "Golden Hour Countdown - Cabo de Rama Clifftop",
            "message": "🌅 Sunset in South Goa today is at 6:28 PM. Peak golden light begins at 5:45 PM. Cabo de Rama Fort offers spectacular panoramic cliffs over the emerald sea.",
            "recommended_action": "View Cabo de Rama Directions",
            "action_payload": {"type": "view_place", "id": "cabo-de-rama-fort"},
            "timestamp": "3:45 PM"
        })
    elif "vagator" in hotel_area.lower():
        alerts.append({
            "id": f"alert-sunset-{active_h_id}",
            "type": "experience",
            "severity": "tip",
            "icon": "🌅",
            "title": "Golden Hour Countdown - Chapora Fort & Thalassa",
            "message": "🌅 Sunset in North Goa today is at 6:28 PM. Peak golden light starts at 5:45 PM. Start moving towards Chapora Fort or Thalassa Siolim to secure prime sunset viewing spots.",
            "recommended_action": "View Thalassa / Chapora directions",
            "action_payload": {"type": "view_place", "id": "thalassa-siolim"},
            "timestamp": "3:45 PM"
        })
    else:
        alerts.append({
            "id": f"alert-sunset-{active_h_id}",
            "type": "experience",
            "severity": "tip",
            "icon": "🌅",
            "title": "Golden Hour Countdown - Fort Aguada Lighthouse",
            "message": "🌅 Sunset in Candolim today is at 6:28 PM. Golden light over the lower bastions of Aguada begins at 5:45 PM. Just a 10-minute walk from your suite.",
            "recommended_action": "View Fort Aguada Walking Route",
            "action_payload": {"type": "view_place", "id": "aguada-fort-lighthouse"},
            "timestamp": "3:45 PM"
        })

    return alerts

def simulate_alert(hotel_id: Optional[str] = "taj-fort-aguada", alert_type: str = "rain_baga") -> Dict[str, Any]:
    """Simulate a realistic proactive travel alert tied specifically to the active hotel."""
    active_h_id = hotel_id or "taj-fort-aguada"
    hotel = get_hotel_info(active_h_id)
    hotel_name = hotel.get("name", "Taj Fort Aguada")
    hotel_area = hotel.get("area", "Sinquerim, Candolim")
    room_type = hotel.get("room_type", "Luxury Suite")
    conf_code = hotel.get("confirmation_code", "CONF-DEMO")
    current_time = datetime.now().strftime("%I:%M %p")

    type_lower = alert_type.lower()

    if "checkin" in type_lower or "key" in type_lower:
        return {
            "id": f"sim-checkin-{active_h_id}",
            "type": "concierge",
            "severity": "info",
            "icon": "🔑",
            "title": f"Digital Key Active • {hotel_name}",
            "message": f"🏨 Welcome! Your {room_type} (Ref: {conf_code}) is prepared with personalized welcome refreshments. Concierge desk & sunset cocktail voucher are now active.",
            "recommended_action": f"View {hotel_name} amenities and dining options",
            "timestamp": current_time,
            "is_simulated": True
        }
    elif "sunset" in type_lower or "golden" in type_lower:
        if "cavelossim" in hotel_area.lower() or "mobor" in hotel_area.lower():
            target_place = "Cabo de Rama Fort"
            target_id = "cabo-de-rama-fort"
        elif "vagator" in hotel_area.lower():
            target_place = "Chapora Fort & Thalassa Siolim"
            target_id = "thalassa-siolim"
        else:
            target_place = "Fort Aguada & Sinquerim Beach"
            target_id = "aguada-fort-lighthouse"

        return {
            "id": f"sim-sunset-{active_h_id}",
            "type": "experience",
            "severity": "tip",
            "icon": "🌅",
            "title": f"Golden Hour Alert • {target_place}",
            "message": f"🌅 Sunset today is at 6:28 PM. Peak golden lighting begins in 45 minutes near {target_place}. Prime spots fill quickly!",
            "recommended_action": f"View directions to {target_place}",
            "timestamp": current_time,
            "is_simulated": True
        }
    elif "tide" in type_lower or "wave" in type_lower:
        return {
            "id": f"sim-tide-{active_h_id}",
            "type": "safety",
            "severity": "warning",
            "icon": "🌊",
            "title": f"High Tide Advisory • {hotel_area} Coastline",
            "message": f"🌊 High tide recorded along {hotel_area}. Water sports pause during peak swell. Life guards recommend calm swimming areas near the hotel.",
            "recommended_action": "Check verified beach safety and indoor activities",
            "timestamp": current_time,
            "is_simulated": True
        }
    else:
        # Default weather/rain alert
        return {
            "id": f"sim-rain-{active_h_id}",
            "type": "weather",
            "severity": "warning",
            "icon": "🌧️",
            "title": f"Evening Weather Advisory • {hotel_area}",
            "message": f"🌧️ Weather radar indicates brief coastal showers near {hotel_area} around 6:00 PM. Concierge recommends cozy indoor dining or early afternoon sightseeing.",
            "recommended_action": "Ask Concierge for indoor dining reservations near hotel",
            "timestamp": current_time,
            "is_simulated": True
        }
