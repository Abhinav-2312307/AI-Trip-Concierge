import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from .tools import load_data, get_hotel_info

def generate_itinerary(
    days: int = 3,
    focus: str = "balanced",
    guest_name: Optional[str] = None,
    start_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate a realistic, balanced day-by-day Goa itinerary using authentic places from the knowledge base.
    Each day features:
    - Morning activity / beach
    - Afternoon culture / exploration + Lunch spot
    - Evening sunset / nightlife + Dinner recommendation
    - Realistic travel times, tips, budget indicators, and dynamic calendar dates.
    """
    data = load_data()
    places = {p["id"]: p for p in data.get("places", [])}
    hotel = get_hotel_info()

    # Determine start date
    if start_date:
        try:
            base_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        except Exception:
            base_date = datetime.now().date() + timedelta(days=1)
    else:
        base_date = datetime.now().date() + timedelta(days=1)

    # Pre-curated high quality sequences tailored to days
    day_plans = []

    # Day 1: North Goa Coastal Charm & Classic Flavors (Candolim -> Calangute -> Assagao)
    day_1 = {
        "day_number": 1,
        "title": "Coastal Heritage, Sun-drenched Sands & Garden Dining",
        "theme": "Local Discovery & Sunset Romance",
        "morning": {
            "time": "08:30 AM - 11:30 AM",
            "place": places.get("aguada-fort-lighthouse", {}),
            "activity_title": "Explore 17th-century Fort Aguada & Lower Lighthouse",
            "description": "Start your morning with sweeping panoramic ocean views from the Portuguese bastions right next to your resort. Enjoy cool morning sea breezes before midday sun.",
            "duration": "1.5 hours",
            "distance_from_hotel": "0.8 km (2 mins drive / 10 mins walk)",
            "budget": "₹50 entry fee"
        },
        "afternoon": {
            "time": "12:30 PM - 04:00 PM",
            "place": places.get("pousada-by-the-beach", {}),
            "activity_title": "Leisurely Seaside Lunch at Pousada by the Beach & Calangute Stroll",
            "description": "Savor authentic Goan Balchao and fresh catch in a quiet shaded garden sanctuary right on the beach, followed by a relaxed beachside walk.",
            "duration": "2.5 hours",
            "distance_from_hotel": "4.5 km (~10 mins)",
            "budget": "₹₹₹ (₹2,200 for two)",
            "food_tip": "Must-try: Sungta (Prawn) Balchao and tender coconut feni cocktail."
        },
        "evening": {
            "time": "05:30 PM - 10:30 PM",
            "place": places.get("gunpowder-assagao", {}),
            "activity_title": "Sunset Cocktails & Peninsular Coastal Dinner at Gunpowder",
            "description": "Head into the bohemian village of Assagao. Dine under a 150-year-old Portuguese villa's illuminated canopy surrounded by lush tropical gardens.",
            "duration": "3 hours",
            "distance_from_hotel": "14 km (~30 mins)",
            "budget": "₹₹₹ (₹1,800 for two)",
            "food_tip": "Order the Kerala Mutton Curry with hot fluffy appams."
        }
    }
    day_plans.append(day_1)

    # Day 2: Panjim Latin Heritage & Arabian Sea Catamaran Sunset
    day_2 = {
        "day_number": 2,
        "title": "Old World Latin Charm & Sunset River Catamaran",
        "theme": "Culture, Azulejos & Mandovi Serenade",
        "morning": {
            "time": "09:00 AM - 12:30 PM",
            "place": places.get("fontainhas-latin-quarter", {}),
            "activity_title": "Photowalk through Fontainhas Latin Quarter & Portuguese Bakeries",
            "description": "Wander through Asia's only Latin Quarter, marveling at indigo and marigold heritage villas. Stop by Confeitaria 31 De Janeiro for fresh warm pastries.",
            "duration": "2.5 hours",
            "distance_from_hotel": "13 km (~25 mins)",
            "budget": "Free walk + ₹200 for bakery treats"
        },
        "afternoon": {
            "time": "01:00 PM - 04:30 PM",
            "place": places.get("basilica-bom-jesus-old-goa", {}),
            "activity_title": "UNESCO World Heritage Tour at Old Goa & Goan Fish Thali",
            "description": "Visit the majestic 16th-century Basilica of Bom Jesus and Sé Cathedral. Stop on the way back for a legendary local Goan thali with crispy rava fry.",
            "duration": "3 hours",
            "distance_from_hotel": "22 km (~35 mins)",
            "budget": "₹600 for lunch"
        },
        "evening": {
            "time": "05:15 PM - 09:30 PM",
            "place": places.get("mandovi-sunset-cruise", {}),
            "activity_title": "Mandovi River Luxury Sunset Cruise & Waterfront Dinner",
            "description": "Watch the sun sink into the Arabian sea from a luxury catamaran with live saxophone music, followed by fresh seafood dinner at The Fisherman's Wharf Candolim.",
            "duration": "3.5 hours",
            "distance_from_hotel": "14 km (~25 mins)",
            "budget": "₹1,800 - ₹2,500 per person",
            "food_tip": "Finish with traditional layered Goan Bebinca and ice cream."
        }
    }
    day_plans.append(day_2)

    # Day 3: Bohemian North & Iconic Vagator / Siolim Sunset Vibes
    day_3 = {
        "day_number": 3,
        "title": "Pristine Northern Beaches, Chapora Vistas & Cliffside Dining",
        "theme": "Boho Beach Club & Sunset Spectacle",
        "morning": {
            "time": "09:30 AM - 01:30 PM",
            "place": places.get("ashvem-mandrem-beach", {}),
            "activity_title": "Relaxed Morning at Ashvem Beach & Organic Acai Cafe",
            "description": "Unwind on the expansive, calm sands of Ashvem. Rent a shaded beachfront cabana and indulge in artisan smoothie bowls and French bakery goods.",
            "duration": "3.5 hours",
            "distance_from_hotel": "22 km (~40 mins)",
            "budget": "Free beach / ₹1,000 cafe spend"
        },
        "afternoon": {
            "time": "02:00 PM - 04:30 PM",
            "place": places.get("vinayak-family-restaurant", {}),
            "activity_title": "Authentic Village Lunch at Vinayak overlooking Paddy Fields",
            "description": "Feast on the famous Goan Surmai / Pomfret fish thali served with coconut sol kadi and crispy fried prawns in a picturesque village setting.",
            "duration": "1.5 hours",
            "distance_from_hotel": "13 km (~25 mins)",
            "budget": "₹ (₹600 for two)"
        },
        "evening": {
            "time": "05:00 PM - 10:30 PM",
            "place": places.get("thalassa-siolim", {}),
            "activity_title": "Golden Hour at Chapora Fort ruins & Greek Feast at Thalassa",
            "description": "Catch breathtaking sunset panoramas at Chapora Fort ('Dil Chahta Hai' point), then head to Thalassa for Greek souvlaki, cocktails, and live riverfront music.",
            "duration": "4 hours",
            "distance_from_hotel": "18 km (~35 mins)",
            "budget": "₹₹₹₹ (₹2,800 for two)",
            "food_tip": "Must-try: Greek Spanakopita and signature Pomegranate Sangria."
        }
    }
    day_plans.append(day_3)

    # Day 4 (If requested): Marine Adventure & Secret Island
    day_4 = {
        "day_number": 4,
        "title": "Grande Island Coral Scuba Diving & Dolphin Cruise",
        "theme": "Ocean Adventure & Candolim Sunset Shack",
        "morning": {
            "time": "08:00 AM - 01:30 PM",
            "place": places.get("grand-island-scuba", {}),
            "activity_title": "Grande Island Scuba Diving & Dolphin Watching Boat Trip",
            "description": "Depart from Sinquerim Jetty right outside Taj Fort Aguada for an exciting boat ride to Grande Island. Snorkel along vibrant coral reefs with tropical fish.",
            "duration": "5 hours",
            "distance_from_hotel": "1.2 km (Sinquerim Jetty)",
            "budget": "₹2,500 - ₹3,500 per person (includes boat & BBQ lunch)"
        },
        "afternoon": {
            "time": "02:30 PM - 05:00 PM",
            "place": places.get("sinquerim-candolim-beach", {}),
            "activity_title": "Rejuvenation at Taj Jiva Spa & Candolim Beach Walk",
            "description": "Relax after your dive with an Ayurvedic spa session or a calm afternoon poolside cocktail overlooking the Arabian Sea.",
            "duration": "2.5 hours",
            "distance_from_hotel": "At Hotel",
            "budget": "Spa treatments as per resort menu"
        },
        "evening": {
            "time": "06:00 PM - 11:00 PM",
            "place": places.get("brittos-baga", {}),
            "activity_title": "Iconic Sunset Beach Shack Dinner at Britto's Baga",
            "description": "Experience Goa's classic beach shack culture with candlelit tables on the sand, butter garlic crab, chilled drinks, and ocean waves.",
            "duration": "3.5 hours",
            "distance_from_hotel": "6.5 km (~15 mins)",
            "budget": "₹₹ (₹1,200 for two)"
        }
    }
    day_plans.append(day_4)

    # Day 5 (If requested): South Goa Paradise Expedition
    day_5 = {
        "day_number": 5,
        "title": "South Goa Turquoise Bay & Tropical Spice Plantation",
        "theme": "Untouched Nature & Crescent Beaches",
        "morning": {
            "time": "08:30 AM - 01:00 PM",
            "place": places.get("sahakari-spice-farm", {}),
            "activity_title": "Sahakari Spice Farm Plantation Walk & Banana Leaf Feast",
            "description": "Explore the lush rainforest interior of Ponda. Breathe in fresh cardamom and vanilla, then enjoy an authentic Goan Hindu buffet with herbal teas.",
            "duration": "3.5 hours",
            "distance_from_hotel": "38 km (~55 mins)",
            "budget": "₹600 per person (includes lunch)"
        },
        "afternoon": {
            "time": "02:00 PM - 06:30 PM",
            "place": places.get("palolem-beach", {}),
            "activity_title": "Kayak in Turquoise Waters at Palolem Crescent Beach",
            "description": "Visit South Goa's most picturesque bay. Paddle calm waters to Butterfly Beach or lounge in colorful beach shacks surrounded by palm groves.",
            "duration": "4 hours",
            "distance_from_hotel": "75 km (~1 hr 50 mins)",
            "budget": "₹300/hr kayak rental"
        },
        "evening": {
            "time": "07:30 PM - 10:30 PM",
            "place": places.get("fishermans-wharf-candolim", {}),
            "activity_title": "Farewell Goan Seafood Celebration at The Fisherman's Wharf",
            "description": "Return to Candolim for a celebratory farewell dinner with fresh Kingfish rava fry, Crab Xec Xec, and live acoustic music.",
            "duration": "2.5 hours",
            "distance_from_hotel": "2.5 km (~7 mins)",
            "budget": "₹₹₹ (₹1,600 for two)"
        }
    }
    day_plans.append(day_5)

    # Slice requested number of days (clamped between 1 and 5)
    clamped_days = max(1, min(days, 5))
    selected_plans = []

    for idx, plan in enumerate(day_plans[:clamped_days]):
        day_date = base_date + timedelta(days=idx)
        plan_copy = {
            **plan,
            "date": day_date.strftime("%Y-%m-%d"),
            "date_formatted": day_date.strftime("%a, %b %d"),
            "full_date_formatted": day_date.strftime("%A, %B %d, %Y")
        }
        selected_plans.append(plan_copy)

    hotel_name = hotel.get("name", "Taj Fort Aguada Resort & Spa, Goa")
    active_guest = guest_name.strip() if (guest_name and guest_name.strip()) else hotel.get("guest_name", "")

    return {
        "guest_name": active_guest,
        "hotel": hotel_name,
        "total_days": clamped_days,
        "start_date": base_date.strftime("%Y-%m-%d"),
        "itinerary": selected_plans,
        "summary": f"{clamped_days}-Day Curated Goa Itinerary starting from {hotel_name}, North Goa."
    }
