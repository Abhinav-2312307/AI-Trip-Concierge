import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app
from app.tools import get_hotels, haversine_distance, search_nearby_places, search_restaurants, search_activities, get_transport_tips

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_get_hotels_all():
    response = client.get("/api/hotels")
    assert response.status_code == 200
    data = response.json()
    assert "properties" in data
    assert len(data["properties"]) >= 6
    names = [h["name"] for h in data["properties"]]
    assert any("Taj Fort Aguada" in n for n in names)
    assert any("W Goa" in n for n in names)
    assert any("Westin" in n for n in names)
    assert any("ITC Grand Goa" in n for n in names)
    assert any("Alila Diwa" in n for n in names)
    assert any("Park Hyatt" in n for n in names)

def test_get_hotels_search():
    response = client.get("/api/hotels?search=Taj")
    assert response.status_code == 200
    data = response.json()
    assert len(data["properties"]) >= 1
    assert "Taj" in data["properties"][0]["name"]

def test_get_hotels_region_filter():
    response = client.get("/api/hotels?region=North%20Goa")
    assert response.status_code == 200
    data = response.json()
    assert len(data["properties"]) >= 3
    for h in data["properties"]:
        assert h["region"] == "North Goa"

def test_get_hotels_area_filter():
    response = client.get("/api/hotels?area=Vagator")
    assert response.status_code == 200
    data = response.json()
    assert len(data["properties"]) >= 1
    assert data["properties"][0]["area"] == "Vagator"

def test_get_hotel_by_id():
    response = client.get("/api/hotels/taj-fort-aguada")
    assert response.status_code == 200
    hotel = response.json()
    assert hotel["id"] == "taj-fort-aguada"
    assert len(hotel["rooms"]) >= 3

def test_haversine_distance():
    # Sinquerim to Candolim is ~2-3 km
    dist = haversine_distance(15.4920, 73.7735, 15.5180, 73.7680)
    assert 2.0 < dist < 4.0

def test_search_nearby_with_gps():
    # Coordinates for Candolim / Sinquerim
    results = search_nearby_places(lat=15.4920, lng=73.7735, radius_km=10.0, limit=5)
    assert len(results) > 0
    assert "distance_km" in results[0]
    assert results[0]["distance_km"] <= results[-1]["distance_km"] # Sorted by distance

def test_chat_fallback_restaurants():
    payload = {
        "message": "Where should I eat tonight?",
        "hotel_id": "taj-fort-aguada",
        "history": []
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 50
    assert len(data.get("tool_calls", [])) > 0

def test_chat_fallback_near_me_with_gps():
    payload = {
        "message": "What beaches are near me?",
        "hotel_id": "taj-fort-aguada",
        "user_lat": 15.4920,
        "user_lng": 73.7735,
        "history": []
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 50
    assert any("search_nearby_places" in tc["tool"] for tc in data.get("tool_calls", []))

def test_chat_fallback_romantic():
    payload = {
        "message": "Plan a romantic evening.",
        "hotel_id": "w-goa",
        "history": []
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "romantic" in data["reply"].lower() or "sunset" in data["reply"].lower() or "dinner" in data["reply"].lower()

def test_chat_fallback_transport():
    payload = {
        "message": "How do I travel from Candolim to Panjim?",
        "hotel_id": "taj-fort-aguada",
        "history": []
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "taxi" in data["reply"].lower() or "travel" in data["reply"].lower() or "panjim" in data["reply"].lower()

def test_chat_fallback_rain():
    payload = {
        "message": "Change my itinerary because of rain.",
        "hotel_id": "the-westin-goa",
        "history": []
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "indoor" in data["reply"].lower() or "rain" in data["reply"].lower() or "museum" in data["reply"].lower() or "spa" in data["reply"].lower()

def test_itinerary_generate():
    payload = {
        "hotel_id": "taj-fort-aguada",
        "days": 3,
        "preferences": ["beaches", "food", "culture"]
    }
    response = client.post("/api/itinerary/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "itinerary" in data
    assert len(data["itinerary"]) == 3
    for day in data["itinerary"]:
        assert "morning" in day
        assert "afternoon" in day
        assert "evening" in day

def test_coastal_conditions():
    response = client.get("/api/coastal-conditions")
    assert response.status_code == 200
    data = response.json()
    assert "sunset" in data
    assert "tide" in data
    assert "ocean" in data

def test_get_reviews():
    response = client.get("/api/reviews?hotel_id=taj-fort-aguada")
    assert response.status_code == 200
    data = response.json()
    assert "reviews" in data
    assert "average_rating" in data
    assert len(data["reviews"]) >= 1
    assert data["average_rating"] > 0
    assert "cleanliness" in data["category_averages"]

def test_create_review():
    payload = {
        "hotel_id": "taj-fort-aguada",
        "guest_name": "Priya Sharma",
        "rating": 5,
        "title": "Unforgettable Heritage Stay",
        "comment": "The Arabian sea views from the cliff and the personalized heritage walk were extraordinary.",
        "travel_type": "Couple",
        "category_ratings": {
            "cleanliness": 5.0,
            "service": 5.0,
            "location": 5.0,
            "dining": 4.0,
            "value": 4.0
        },
        "tags": ["Ocean View", "Exceptional Breakfast"]
    }
    response = client.post("/api/reviews", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "review" in data
    assert data["review"]["guest_name"] == "Priya Sharma"
    assert data["review"]["rating"] == 5.0
    assert data["review"]["verified_stay"] is True
    assert "id" in data["review"]
    
    # Verify it can be upvoted
    review_id = data["review"]["id"]
    vote_res = client.post(f"/api/reviews/{review_id}/helpful")
    assert vote_res.status_code == 200
    assert vote_res.json()["helpful_count"] >= 1

def test_chat_feedback():
    payload = {
        "message_id": "msg-123",
        "feedback_type": "positive",
        "hotel_id": "taj-fort-aguada",
        "comment": "Great beach recommendation!"
    }
    response = client.post("/api/feedback/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"


