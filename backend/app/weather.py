"""
Real Weather Service using Open-Meteo API (100% free, no API key required).
Provides geocoding, current weather, and forecast data for any location worldwide.
"""
import requests
import logging
from typing import Dict, Any, Optional, Tuple
from datetime import datetime

logger = logging.getLogger("ai_concierge.weather")

# WMO Weather interpretation codes → human-readable descriptions
WMO_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}

# Rain-related codes for alert generation
RAIN_CODES = {51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99}
SNOW_CODES = {71, 73, 75, 77, 85, 86}
STORM_CODES = {95, 96, 99}


def geocode_location(city_name: str) -> Optional[Dict[str, Any]]:
    """Geocode a city/location name to coordinates using Open-Meteo Geocoding API."""
    try:
        url = "https://geocoding-api.open-meteo.com/v1/search"
        params = {"name": city_name, "count": 1, "language": "en"}
        res = requests.get(url, params=params, timeout=8)
        if res.status_code == 200:
            data = res.json()
            results = data.get("results", [])
            if results:
                r = results[0]
                return {
                    "name": r.get("name", city_name),
                    "latitude": r.get("latitude"),
                    "longitude": r.get("longitude"),
                    "country": r.get("country", ""),
                    "admin1": r.get("admin1", ""),  # state/province
                    "timezone": r.get("timezone", "auto"),
                    "elevation": r.get("elevation", 0),
                }
        logger.warning(f"Geocoding failed for '{city_name}': {res.status_code}")
    except Exception as e:
        logger.error(f"Geocoding error for '{city_name}': {e}")
    return None


def fetch_real_weather(latitude: float, longitude: float, timezone: str = "auto") -> Optional[Dict[str, Any]]:
    """Fetch current weather and daily forecast from Open-Meteo API."""
    try:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature",
            "daily": "sunrise,sunset,temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,uv_index_max",
            "timezone": timezone,
            "forecast_days": 3,
        }
        res = requests.get(url, params=params, timeout=8)
        if res.status_code == 200:
            return res.json()
        logger.warning(f"Weather API returned {res.status_code}")
    except Exception as e:
        logger.error(f"Weather fetch error: {e}")
    return None


def get_real_weather_for_location(
    city_name: str,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    timezone: str = "auto"
) -> Dict[str, Any]:
    """
    Get real weather data for a location. Geocodes if lat/lng not provided.
    Returns data in the same shape as the existing weather_summary for frontend compatibility.
    """
    # Geocode if needed
    if latitude is None or longitude is None:
        geo = geocode_location(city_name)
        if geo:
            latitude = geo["latitude"]
            longitude = geo["longitude"]
            timezone = geo.get("timezone", "auto")
        else:
            # Return a fallback with unknown weather
            return _fallback_weather(city_name)

    raw = fetch_real_weather(latitude, longitude, timezone)
    if not raw:
        return _fallback_weather(city_name)

    current = raw.get("current", {})
    daily = raw.get("daily", {})

    temp_c = current.get("temperature_2m", 25)
    humidity = current.get("relative_humidity_2m", 60)
    weather_code = current.get("weather_code", 0)
    wind_speed = current.get("wind_speed_10m", 0)
    feels_like = current.get("apparent_temperature", temp_c)
    condition_text = WMO_CODES.get(weather_code, "Unknown")

    # Today's daily data
    sunrise = ""
    sunset = ""
    precip_prob = 0
    uv_index = 0
    temp_max = temp_c
    temp_min = temp_c
    daily_weather_code = weather_code

    if daily:
        sunrise_list = daily.get("sunrise", [])
        sunset_list = daily.get("sunset", [])
        precip_list = daily.get("precipitation_probability_max", [])
        uv_list = daily.get("uv_index_max", [])
        max_list = daily.get("temperature_2m_max", [])
        min_list = daily.get("temperature_2m_min", [])
        daily_codes = daily.get("weather_code", [])

        if sunrise_list:
            sunrise = _format_time(sunrise_list[0])
        if sunset_list:
            sunset = _format_time(sunset_list[0])
        if precip_list:
            precip_prob = precip_list[0] or 0
        if uv_list:
            uv_index = uv_list[0] or 0
        if max_list:
            temp_max = max_list[0]
        if min_list:
            temp_min = min_list[0]
        if daily_codes:
            daily_weather_code = daily_codes[0]

    # Determine evening forecast text
    is_rainy = weather_code in RAIN_CODES or daily_weather_code in RAIN_CODES
    is_stormy = weather_code in STORM_CODES or daily_weather_code in STORM_CODES
    is_snowy = weather_code in SNOW_CODES or daily_weather_code in SNOW_CODES

    if is_stormy:
        evening_forecast = f"⛈️ Thunderstorm conditions expected. Stay indoors and avoid outdoor activities."
    elif is_rainy:
        evening_forecast = f"🌧️ Rain expected (precipitation probability: {precip_prob}%). Consider indoor dining and activities."
    elif is_snowy:
        evening_forecast = f"❄️ Snowfall expected. Bundle up warm and enjoy the winter magic!"
    elif precip_prob > 50:
        evening_forecast = f"🌥️ Clouds building up with {precip_prob}% chance of rain. Carry an umbrella just in case."
    elif temp_c > 35:
        evening_forecast = f"🌡️ Very hot conditions ({temp_c}°C). Stay hydrated and avoid midday sun."
    elif temp_c < 5:
        evening_forecast = f"🥶 Very cold conditions ({temp_c}°C). Layer up and enjoy warm beverages."
    else:
        evening_forecast = f"Pleasant conditions expected. Great evening for outdoor dining and sightseeing."

    # Build 3-day forecast if available
    forecast_days = []
    if daily:
        dates = daily.get("time", [])
        for i in range(min(3, len(dates))):
            forecast_days.append({
                "date": dates[i] if i < len(dates) else "",
                "temp_max": max_list[i] if i < len(max_list) else 0,
                "temp_min": min_list[i] if i < len(min_list) else 0,
                "condition": WMO_CODES.get(daily_codes[i] if i < len(daily_codes) else 0, "Unknown"),
                "precip_probability": precip_list[i] if i < len(precip_list) else 0,
            })

    return {
        "area": city_name,
        "temperature_c": round(temp_c, 1),
        "feels_like_c": round(feels_like, 1),
        "temp_max_c": round(temp_max, 1),
        "temp_min_c": round(temp_min, 1),
        "condition": condition_text,
        "weather_code": weather_code,
        "evening_forecast": evening_forecast,
        "humidity": f"{humidity}%",
        "wind_speed_kmph": round(wind_speed, 1),
        "sunset_time": sunset,
        "sunrise_time": sunrise,
        "uv_index": round(uv_index, 1),
        "precipitation_probability": precip_prob,
        "is_rainy": is_rainy,
        "is_stormy": is_stormy,
        "is_snowy": is_snowy,
        "forecast_days": forecast_days,
        # Legacy fields for frontend compatibility
        "golden_hour_start": _golden_hour(sunset),
        "sea_condition": "N/A (non-coastal)" if not _is_coastal_hint(city_name) else "Check local conditions",
        "tide_schedule": {"low_tide": "N/A", "high_tide": "N/A"},
        "is_simulated_demo": False,
        "is_real": True,
    }


def _fallback_weather(city_name: str) -> Dict[str, Any]:
    """Fallback weather when API is unreachable."""
    return {
        "area": city_name,
        "temperature_c": 25,
        "feels_like_c": 25,
        "temp_max_c": 28,
        "temp_min_c": 22,
        "condition": "Data unavailable",
        "weather_code": -1,
        "evening_forecast": "Weather data temporarily unavailable. Check local forecasts.",
        "humidity": "N/A",
        "wind_speed_kmph": 0,
        "sunset_time": "6:30 PM",
        "sunrise_time": "6:00 AM",
        "uv_index": 0,
        "precipitation_probability": 0,
        "is_rainy": False,
        "is_stormy": False,
        "is_snowy": False,
        "forecast_days": [],
        "golden_hour_start": "5:45 PM",
        "sea_condition": "N/A",
        "tide_schedule": {"low_tide": "N/A", "high_tide": "N/A"},
        "is_simulated_demo": False,
        "is_real": False,
    }


def _format_time(iso_str: str) -> str:
    """Convert ISO datetime string to 12-hour format."""
    try:
        dt = datetime.fromisoformat(iso_str)
        return dt.strftime("%I:%M %p").lstrip("0")
    except Exception:
        return iso_str


def _golden_hour(sunset_str: str) -> str:
    """Estimate golden hour start (~45 min before sunset)."""
    try:
        # Parse "6:28 PM" style
        dt = datetime.strptime(sunset_str.strip(), "%I:%M %p")
        from datetime import timedelta
        golden = dt - timedelta(minutes=45)
        return golden.strftime("%I:%M %p").lstrip("0")
    except Exception:
        return "5:45 PM"


def _is_coastal_hint(city_name: str) -> bool:
    """Quick heuristic check if a city might be coastal."""
    coastal_keywords = [
        "goa", "beach", "mumbai", "chennai", "kochi", "vizag", "puri",
        "pondicherry", "puducherry", "mangalore", "kovalam", "varkala",
        "andaman", "lakshadweep", "maldives", "bali", "phuket", "miami",
    ]
    return any(k in city_name.lower() for k in coastal_keywords)
