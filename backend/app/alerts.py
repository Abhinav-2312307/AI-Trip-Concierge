from typing import List, Dict, Any, Optional
from datetime import datetime
from .tools import load_data

def get_active_alerts() -> List[Dict[str, Any]]:
    """Retrieve simulated proactive alerts from the knowledge base."""
    data = load_data()
    return data.get("simulated_alerts", [])

def simulate_alert(alert_type: str = "rain_baga") -> Dict[str, Any]:
    """
    Simulate a realistic proactive travel alert.
    Supported types:
    - 'rain_baga' (Weather rain alert at 6 PM in Baga with indoor dining recommendation)
    - 'checkin_reminder' (Taj Fort Aguada check-in key & welcome drink voucher)
    - 'sunset_countdown' (Golden hour notification for Chapora Fort / Thalassa)
    - 'high_tide' (Sea swell advisory at Vagator)
    """
    alerts = get_active_alerts()
    
    mapping = {
        "rain_baga": "alert-rain-baga",
        "weather": "alert-rain-baga",
        "checkin": "alert-checkin-taj",
        "checkin_reminder": "alert-checkin-taj",
        "sunset": "alert-sunset-chapora",
        "sunset_countdown": "alert-sunset-chapora",
        "tide": "alert-tide-vagator",
        "high_tide": "alert-tide-vagator"
    }

    target_id = mapping.get(alert_type.lower(), "alert-rain-baga")
    
    for alert in alerts:
        if alert.get("id") == target_id:
            return {
                **alert,
                "timestamp": datetime.now().strftime("%I:%M %p"),
                "is_simulated": True,
                "note": "Simulated live concierge alert for demo purposes."
            }
            
    # Default fallback alert
    return {
        "id": "alert-rain-baga",
        "type": "weather",
        "severity": "warning",
        "icon": "🌧️",
        "title": "Evening Rain Advisory - Baga & Calangute",
        "message": "🌧️ Heads up — rain is expected in Baga after 6 PM today. Consider planning an indoor activity or an earlier beach visit.",
        "recommended_action": "Switch to indoor dining at Gunpowder Assagao or Fontainhas Latin Quarter walk",
        "timestamp": datetime.now().strftime("%I:%M %p"),
        "is_simulated": True
    }
