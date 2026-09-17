import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from .tools import load_data, get_hotel_info, _resolve_distance

def generate_itinerary(
    hotel_id: Optional[str] = "taj-fort-aguada",
    days: int = 3,
    focus: str = "balanced",
    guest_name: Optional[str] = None,
    start_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate a realistic, personalized day-by-day Goa itinerary tailored to the active hotel.
    Prioritizes nearby attractions, realistic sequencing, and verified places in the knowledge base.
    """
    active_h_id = hotel_id or "taj-fort-aguada"
    hotel = get_hotel_info(active_h_id)
    data = load_data()
    raw_places = data.get("places", [])
    
    # Map places with distance computed for this hotel
    places = {}
    for p in raw_places:
        p_copy = dict(p)
        p_copy["distance_from_hotel"] = _resolve_distance(p_copy, active_h_id)
        places[p["id"]] = p_copy

    # Determine start date dynamically
    if start_date:
        try:
            base_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        except Exception:
            base_date = datetime.now().date() + timedelta(days=1)
    else:
        base_date = datetime.now().date() + timedelta(days=1)

    hotel_name = hotel.get("name", "Taj Fort Aguada Resort & Spa, Goa")
    hotel_area = hotel.get("area", "Candolim, Goa")
    hotel_region = hotel.get("region", "North Goa")

    # Build hotel-specific sequence plans
    if active_h_id == "the-leela-goa":
        # -------------------------------------------------------------
        # South Goa Itinerary: The Leela Goa (Mobor, Cavelossim)
        # -------------------------------------------------------------
        day_plans = [
            {
                "day_number": 1,
                "title": "Pristine Mobor Sands, River Sal Catamaran & Cavatina Tasting",
                "theme": "South Goa Serenity & Haute Cuisine",
                "morning": {
                    "time": "08:30 AM - 11:30 AM",
                    "place": places.get("mobor-cavelossim-beach", {}),
                    "activity_title": "Morning Dolphin Cruise & Swim at Mobor Beach",
                    "description": "Step directly onto Mobor Beach from the resort gardens. Spot playful dolphins near the Sal estuary and enjoy pristine white sands.",
                    "duration": "2.5 hours",
                    "distance_from_hotel": "0.2 km (Direct Private Beach Access)",
                    "budget": "Free / ₹800 dolphin boat"
                },
                "afternoon": {
                    "time": "12:30 PM - 04:00 PM",
                    "place": places.get("fishermans-wharf-mobor", {}),
                    "activity_title": "Riverside Seafood Feast at Fisherman's Wharf Mobor",
                    "description": "Dine on the open-air wooden deck on River Sal. Savor butter garlic crab and Goan fish curry while watching fishing trawlers glide by.",
                    "duration": "2.5 hours",
                    "distance_from_hotel": "0.8 km (2 mins drive / 10 mins walk)",
                    "budget": "₹₹₹ (₹1,800 for two)",
                    "food_tip": "Must-try: Butter Garlic Mud Crab and Fresh Lime Sol Kadi."
                },
                "evening": {
                    "time": "06:30 PM - 10:30 PM",
                    "place": places.get("cavatina-cuchina-benaulim", {}),
                    "activity_title": "Contemporary Goan Tasting Menu at Cavatina by Chef Avinash",
                    "description": "Experience modern reimagined Goan culinary heritage. An intimate gastronomic journey celebrated as one of India's top 50 dining spots.",
                    "duration": "3 hours",
                    "distance_from_hotel": "12 km (~20 mins)",
                    "budget": "₹₹₹₹ (₹3,200 for two)",
                    "food_tip": "Order the 7-course indigenous Goan tasting menu."
                }
            },
            {
                "day_number": 2,
                "title": "Cabo de Rama Emerald Cliffs & Legendary Martin's Corner",
                "theme": "South Goa Fortresses & Iconic Flavors",
                "morning": {
                    "time": "09:00 AM - 12:30 PM",
                    "place": places.get("cabo-de-rama-fort", {}),
                    "activity_title": "Explore Clifftop Ruins & Emerald Vista at Cabo de Rama",
                    "description": "Drive down scenic coastal country roads to one of Goa's oldest cliffside fortresses. Capture dramatic panoramic ocean views from the bastions.",
                    "duration": "2.5 hours",
                    "distance_from_hotel": "22 km (~35 mins)",
                    "budget": "Free entry"
                },
                "afternoon": {
                    "time": "01:00 PM - 04:30 PM",
                    "place": places.get("martins-corner-betalbatim", {}),
                    "activity_title": "Celebrated Goan Lunch & Live Serenades at Martin's Corner",
                    "description": "Visit Goa's most legendary dining institution in Betalbatim. Enjoy spicy King Crab Recheado, Shark Ambot Tik, and warm Goan hospitality.",
                    "duration": "2.5 hours",
                    "distance_from_hotel": "16 km (~25 mins)",
                    "budget": "₹₹₹ (₹1,700 for two)",
                    "food_tip": "Must-try: King Crab Recheado and Pork Vindaloo with warm poie."
                },
                "evening": {
                    "time": "05:30 PM - 09:30 PM",
                    "place": places.get("zeebop-by-the-sea", {}),
                    "activity_title": "Sunset Cocktails & Beachfront Shack Dinner at Zeebop",
                    "description": "Relax with toes in the sand at Utorda beach. Watch the sun dip into the sea under glowing paper lanterns with fresh tandoori red snapper.",
                    "duration": "3 hours",
                    "distance_from_hotel": "19 km (~30 mins)",
                    "budget": "₹₹₹ (₹1,500 for two)",
                    "food_tip": "Sip fresh coconut feni mojitos with butter garlic calamari."
                }
            },
            {
                "day_number": 3,
                "title": "Palolem Turquoise Crescent Bay & Kayaking Expedition",
                "theme": "Paradise Beach & Secret Coves",
                "morning": {
                    "time": "08:30 AM - 01:00 PM",
                    "place": places.get("palolem-beach", {}),
                    "activity_title": "Kayak in Turquoise Waters at Palolem Crescent Bay",
                    "description": "Head to South Goa's postcard beach. Rent a kayak to paddle into Butterfly Beach cove or swim in the famously calm turquoise lagoon.",
                    "duration": "4 hours",
                    "distance_from_hotel": "34 km (~45 mins)",
                    "budget": "₹300/hr kayak rental"
                },
                "afternoon": {
                    "time": "01:30 PM - 04:30 PM",
                    "place": places.get("sahakari-spice-farm", {}),
                    "activity_title": "Sahakari Spice Plantation Walk & Banana Leaf Feast",
                    "description": "Walk among vanilla vines, cardamom pods, and cinnamon bark in Ponda's lush hinterland, followed by a traditional Goan Hindu buffet.",
                    "duration": "3 hours",
                    "distance_from_hotel": "32 km (~45 mins)",
                    "budget": "₹600 per person (includes full lunch)"
                },
                "evening": {
                    "time": "06:00 PM - 10:00 PM",
                    "place": places.get("fishermans-wharf-mobor", {}),
                    "activity_title": "Twilight Return & Farewell Cocktails along River Sal",
                    "description": "Conclude your South Goa journey with a relaxing riverside evening at Mobor, enjoying artisanal feni cocktails and live acoustic music.",
                    "duration": "3 hours",
                    "distance_from_hotel": "0.8 km (Near Hotel)",
                    "budget": "₹₹₹ (₹1,800 for two)"
                }
            },
            {
                "day_number": 4,
                "title": "Panjim Latin Quarter & Mandovi Luxury Catamaran",
                "theme": "Heritage Architecture & River Cruise",
                "morning": {
                    "time": "09:00 AM - 12:30 PM",
                    "place": places.get("fontainhas-latin-quarter", {}),
                    "activity_title": "Photowalk in Fontainhas & Portuguese Bakeries",
                    "description": "Explore colorful cobblestone lanes and centuries-old villas in Panjim. Sample Swiss rolls and pastel de nata at 31st January Bakery.",
                    "duration": "2.5 hours",
                    "distance_from_hotel": "42 km (~1 hr)",
                    "budget": "Free walk + ₹200 bakery treats"
                },
                "afternoon": {
                    "time": "01:00 PM - 04:30 PM",
                    "place": places.get("basilica-bom-jesus-old-goa", {}),
                    "activity_title": "UNESCO World Heritage Cathedrals in Old Goa",
                    "description": "Marvel at the 16th-century Baroque architecture of the Basilica of Bom Jesus and Sé Cathedral.",
                    "duration": "2.5 hours",
                    "distance_from_hotel": "39 km (~55 mins)",
                    "budget": "Free entry"
                },
                "evening": {
                    "time": "05:15 PM - 09:00 PM",
                    "place": places.get("mandovi-sunset-cruise", {}),
                    "activity_title": "Mandovi River Sunset Catamaran Cruise",
                    "description": "Sail into the Mandovi estuary with live saxophone melodies, champagne toasts, and panoramic sunset vistas.",
                    "duration": "3 hours",
                    "distance_from_hotel": "42 km (~1 hr)",
                    "budget": "₹1,800 - ₹2,500 per person"
                }
            },
            {
                "day_number": 5,
                "title": "Leela Resort Rejuvenation & Private Beach Spa Celebration",
                "theme": "Luxury Wellness & Beachside Farewell",
                "morning": {
                    "time": "09:00 AM - 01:00 PM",
                    "place": places.get("mobor-cavelossim-beach", {}),
                    "activity_title": "Ayurvedic Spa Ritual & Lagoon Golf at The Leela",
                    "description": "Indulge in a signature aromatherapy massage at The Spa by The Leela followed by a relaxed round on the 12-hole executive golf course.",
                    "duration": "3.5 hours",
                    "distance_from_hotel": "At Resort",
                    "budget": "Spa menu rates"
                },
                "afternoon": {
                    "time": "01:30 PM - 04:30 PM",
                    "place": places.get("martins-corner-betalbatim", {}),
                    "activity_title": "Farewell Feast at Martin's Corner",
                    "description": "Celebrate your last afternoon in Goa with savory prawn balchao and bebinca.",
                    "duration": "2.5 hours",
                    "distance_from_hotel": "16 km (~25 mins)",
                    "budget": "₹₹₹ (₹1,700 for two)"
                },
                "evening": {
                    "time": "06:00 PM - 10:30 PM",
                    "place": places.get("cavatina-cuchina-benaulim", {}),
                    "activity_title": "Private Candlelit Beachfront Farewell",
                    "description": "Dine under the starry sky on Mobor Beach with custom grilled catch and vintage port wine.",
                    "duration": "3.5 hours",
                    "distance_from_hotel": "12 km (~20 mins)",
                    "budget": "₹₹₹₹ (₹3,000 for two)"
                }
            }
        ]

    elif active_h_id == "w-goa":
        # -------------------------------------------------------------
        # North Goa Itinerary: W Goa (Vagator Beach)
        # -------------------------------------------------------------
        day_plans = [
            {
                "day_number": 1,
                "title": "Vagator Clifftop Panoramas, Village Thali & Thalassa Sunset",
                "theme": "Vagator Chic & Sunset Spectacle",
                "morning": {
                    "time": "09:00 AM - 11:30 AM",
                    "place": places.get("chapora-fort", {}),
                    "activity_title": "Walk up to Chapora Fort (Dil Chahta Hai Point)",
                    "description": "Start right from W Goa to the iconic red laterite battlements. Enjoy panoramic 360-degree views of Vagator Beach and Chapora river mouth.",
                    "duration": "1.5 hours",
                    "distance_from_hotel": "1.1 km (3 mins drive / 12 mins walk - At Doorstep)",
                    "budget": "Free entry"
                },
                "afternoon": {
                    "time": "12:30 PM - 03:30 PM",
                    "place": places.get("vinayak-family-restaurant", {}),
                    "activity_title": "Authentic Village Fish Thali at Vinayak Assagao",
                    "description": "Feast on the famous Goan Surmai fish thali overlooking tranquil green paddy fields in neighboring Assagao village.",
                    "duration": "1.5 hours",
                    "distance_from_hotel": "4.2 km (~10 mins - Near Hotel)",
                    "budget": "₹ (₹600 for two)",
                    "food_tip": "Order the Surmai Rava Fry and Sol Kadi."
                },
                "evening": {
                    "time": "05:00 PM - 10:30 PM",
                    "place": places.get("thalassa-siolim", {}),
                    "activity_title": "Greek Sunset Feast & Live Music at Thalassa Siolim",
                    "description": "Perched over the Siolim waterfront, enjoy signature pomegranate sangria, Greek souvlaki, and fire dances during sunset.",
                    "duration": "4 hours",
                    "distance_from_hotel": "8.5 km (~18 mins - Near Hotel)",
                    "budget": "₹₹₹₹ (₹2,800 for two)",
                    "food_tip": "Must-try: Spanakopita and Grilled Calamari with Greek dips."
                }
            },
            {
                "day_number": 2,
                "title": "Boho Ashvem Beach Clubs & Heritage Garden Dining at Gunpowder",
                "theme": "Northern Coastline & Culinary Soul",
                "morning": {
                    "time": "09:30 AM - 01:30 PM",
                    "place": places.get("ashvem-mandrem-beach", {}),
                    "activity_title": "Relaxed Morning at Ashvem Beach Cabanas",
                    "description": "Unwind on North Goa's chic and wide coastline. Enjoy artisanal smoothie bowls and gentle ocean breezes away from commercial crowds.",
                    "duration": "3.5 hours",
                    "distance_from_hotel": "12 km (~22 mins - Near Hotel)",
                    "budget": "Free beach / ₹1,000 cafe spend"
                },
                "afternoon": {
                    "time": "02:30 PM - 05:00 PM",
                    "place": places.get("vagator-beach", {}),
                    "activity_title": "Afternoon Lounge & Swim at Ozran (Little Vagator)",
                    "description": "Descend to Little Vagator for a swim, check out the sculpted rock face, and enjoy cocktails at W Rockpool.",
                    "duration": "2.5 hours",
                    "distance_from_hotel": "0.3 km (3 mins walk - At Hotel Doorstep)",
                    "budget": "Free / cocktails at resort"
                },
                "evening": {
                    "time": "06:30 PM - 10:30 PM",
                    "place": places.get("gunpowder-assagao", {}),
                    "activity_title": "Candlelit Garden Coastal Dinner at Gunpowder",
                    "description": "Dine under a 150-year-old Portuguese villa's illuminated canopy in Assagao with spicy peninsular seafood curries.",
                    "duration": "3 hours",
                    "distance_from_hotel": "5.5 km (~12 mins - Near Hotel)",
                    "budget": "₹₹₹ (₹1,800 for two)",
                    "food_tip": "Order the Kerala Mutton Curry with hot appams."
                }
            },
            {
                "day_number": 3,
                "title": "Anjuna Trance Heritage & Latin Quarter Photowalk",
                "theme": "Old World Culture & Sunset Beats",
                "morning": {
                    "time": "09:00 AM - 12:30 PM",
                    "place": places.get("fontainhas-latin-quarter", {}),
                    "activity_title": "Photowalk through Fontainhas Latin Quarter Panjim",
                    "description": "Wander through indigo and marigold Portuguese heritage villas. Stop by Confeitaria 31 De Janeiro for fresh warm pastries.",
                    "duration": "2.5 hours",
                    "distance_from_hotel": "19 km (~35 mins)",
                    "budget": "Free walk + ₹200 bakery treats"
                },
                "afternoon": {
                    "time": "01:00 PM - 04:30 PM",
                    "place": places.get("basilica-bom-jesus-old-goa", {}),
                    "activity_title": "UNESCO World Heritage Cathedrals in Old Goa",
                    "description": "Visit the 16th-century Basilica of Bom Jesus and Sé Cathedral.",
                    "duration": "2.5 hours",
                    "distance_from_hotel": "26 km (~50 mins)",
                    "budget": "Free entry"
                },
                "evening": {
                    "time": "05:30 PM - 11:00 PM",
                    "place": places.get("curlies-anjuna", {}),
                    "activity_title": "Iconic Sunset Beats at Curlies & Shiva Valley Beach Club",
                    "description": "Head down to South Anjuna for classic sunset trance sessions, woodfired pizza, and beach revelry.",
                    "duration": "4 hours",
                    "distance_from_hotel": "3.5 km (~8 mins - Near Hotel)",
                    "budget": "₹₹ (₹1,500 for two)"
                }
            },
            {
                "day_number": 4,
                "title": "Marine Adventure at Grande Island & Candolim Beach Shack",
                "theme": "Ocean Adventure & Goan Seafood",
                "morning": {
                    "time": "08:00 AM - 01:30 PM",
                    "place": places.get("grand-island-scuba", {}),
                    "activity_title": "Grande Island Scuba Diving & Dolphin Cruise",
                    "description": "Depart from Sinquerim Jetty for guided scuba diving along coral reefs with tropical fish and BBQ lunch.",
                    "duration": "5 hours",
                    "distance_from_hotel": "14 km (~30 mins)",
                    "budget": "₹2,500 - ₹3,500 per person"
                },
                "afternoon": {
                    "time": "02:30 PM - 05:00 PM",
                    "place": places.get("pousada-by-the-beach", {}),
                    "activity_title": "Relaxed Seaside Refreshments at Pousada Calangute",
                    "description": "Savor Goan balchao in a quiet shaded garden sanctuary right on Calangute's quiet sands.",
                    "duration": "2 hours",
                    "distance_from_hotel": "9 km (~20 mins)",
                    "budget": "₹₹₹ (₹2,200 for two)"
                },
                "evening": {
                    "time": "06:00 PM - 10:30 PM",
                    "place": places.get("brittos-baga", {}),
                    "activity_title": "Candlelit Seafood Shack Dinner at Britto's Baga",
                    "description": "Experience iconic beach shack dining with butter garlic prawns and baked cheesecake on the sand.",
                    "duration": "3.5 hours",
                    "distance_from_hotel": "6.8 km (~15 mins)",
                    "budget": "₹₹ (₹1,200 for two)"
                }
            },
            {
                "day_number": 5,
                "title": "Hinterland Spice Trails & Mandovi River Catamaran",
                "theme": "Nature Trails & River Sunset",
                "morning": {
                    "time": "09:00 AM - 01:30 PM",
                    "place": places.get("sahakari-spice-farm", {}),
                    "activity_title": "Sahakari Spice Plantation Guided Tour & Buffet",
                    "description": "Explore aromatic vanilla, cardamom, and pepper trails in Ponda with a traditional buffet lunch.",
                    "duration": "3.5 hours",
                    "distance_from_hotel": "44 km (~1 hr 05 mins)",
                    "budget": "₹600 per person"
                },
                "afternoon": {
                    "time": "02:30 PM - 05:00 PM",
                    "place": places.get("aguada-fort-lighthouse", {}),
                    "activity_title": "Visit 17th-century Fort Aguada & Lower Bastions",
                    "description": "Stroll through the historic fortress overlooking the Arabian Sea.",
                    "duration": "2 hours",
                    "distance_from_hotel": "13 km (~25 mins)",
                    "budget": "₹50 entry fee"
                },
                "evening": {
                    "time": "05:15 PM - 09:30 PM",
                    "place": places.get("mandovi-sunset-cruise", {}),
                    "activity_title": "Mandovi River Luxury Catamaran Sunset Cruise",
                    "description": "Celebrate your last night in Goa aboard a luxury catamaran with live saxophone music and sparkling wine.",
                    "duration": "3 hours",
                    "distance_from_hotel": "19 km (~35 mins)",
                    "budget": "₹1,800 - ₹2,500 per person"
                }
            }
        ]

    elif active_h_id == "alila-diwa":
        # -------------------------------------------------------------
        # South Goa Itinerary: Alila Diwa Goa (Majorda)
        # -------------------------------------------------------------
        day_plans = [
            {
                "day_number": 1,
                "title": "Majorda Golden Sands, Martin's Corner & Zeebop Beach Sunset",
                "theme": "Coastal Charm & South Goan Hospitality",
                "morning": {
                    "time": "08:30 AM - 11:30 AM",
                    "place": places.get("majorda-utorda-beach", {}),
                    "activity_title": "Morning Stroll & Calm Swim at Majorda Beach",
                    "description": "Take the resort shuttle to the wide, tranquil sands of Majorda. Enjoy peaceful morning waves and soft golden sands.",
                    "duration": "2.5 hours",
                    "distance_from_hotel": "1.2 km (2 mins shuttle / 10 mins walk)",
                    "budget": "Free entry"
                },
                "afternoon": {
                    "time": "12:30 PM - 03:30 PM",
                    "place": places.get("martins-corner-betalbatim", {}),
                    "activity_title": "Legendary Lunch at Martin's Corner Betalbatim",
                    "description": "Savor authentic Goan coastal dishes like Crab Recheado and Shark Ambot Tik in Goa's most famous family restaurant.",
                    "duration": "2.5 hours",
                    "distance_from_hotel": "2.2 km (~5 mins - Near Hotel)",
                    "budget": "₹₹₹ (₹1,700 for two)",
                    "food_tip": "Must-try: King Crab Recheado and Prawn Masala Fry."
                },
                "evening": {
                    "time": "05:00 PM - 10:00 PM",
                    "place": places.get("zeebop-by-the-sea", {}),
                    "activity_title": "Sunset Shack Dinner on Utorda Beach at Zeebop",
                    "description": "Candlelit dining right on the sand with swaying lanterns, fresh tandoori catch, and chilled feni cocktails.",
                    "duration": "3.5 hours",
                    "distance_from_hotel": "2.8 km (~6 mins - Near Hotel)",
                    "budget": "₹₹₹ (₹1,500 for two)",
                    "food_tip": "Order the Butter Garlic Lobster with warm Goan bread."
                }
            },
            {
                "day_number": 2,
                "title": "Cabo de Rama Emerald Fortress & Cavatina Gourmet Storytelling",
                "theme": "Heritage Heights & Modern Gastronomy",
                "morning": {
                    "time": "09:00 AM - 12:30 PM",
                    "place": places.get("cabo-de-rama-fort", {}),
                    "activity_title": "Clifftop Panoramas at Historic Cabo de Rama Fort",
                    "description": "Drive south to the ancient clifftop fortress. Enjoy breathtaking 360-degree views of turquoise waters crashing on the rocks.",
                    "duration": "2.5 hours",
                    "distance_from_hotel": "35 km (~50 mins)",
                    "budget": "Free entry"
                },
                "afternoon": {
                    "time": "01:00 PM - 04:00 PM",
                    "place": places.get("fishermans-wharf-mobor", {}),
                    "activity_title": "Riverside Lunch at Fisherman's Wharf Mobor",
                    "description": "Dine over the calm River Sal with Goan prawn curry and fresh Kingfish rava fry.",
                    "duration": "2.5 hours",
                    "distance_from_hotel": "18 km (~30 mins)",
                    "budget": "₹₹₹ (₹1,800 for two)"
                },
                "evening": {
                    "time": "06:30 PM - 10:30 PM",
                    "place": places.get("cavatina-cuchina-benaulim", {}),
                    "activity_title": "Artisanal Goan Tasting Menu at Cavatina Benaulim",
                    "description": "Indulge in Chef Avinash Martins' acclaimed modern Goan tasting experience.",
                    "duration": "3 hours",
                    "distance_from_hotel": "7.5 km (~15 mins - Near Hotel)",
                    "budget": "₹₹₹₹ (₹3,200 for two)"
                }
            },
            {
                "day_number": 3,
                "title": "Palolem Crescent Lagoon Kayak & Sahakari Spice Trails",
                "theme": "South Goa Jewels & Tropical Spice",
                "morning": {
                    "time": "08:30 AM - 01:00 PM",
                    "place": places.get("palolem-beach", {}),
                    "activity_title": "Turquoise Waters Kayak at Palolem Beach",
                    "description": "Paddle along South Goa's world-famous crescent bay and visit colorful beach shacks.",
                    "duration": "4 hours",
                    "distance_from_hotel": "48 km (~1 hr 10 mins)",
                    "budget": "₹300/hr kayak"
                },
                "afternoon": {
                    "time": "01:30 PM - 04:30 PM",
                    "place": places.get("sahakari-spice-farm", {}),
                    "activity_title": "Sahakari Spice Farm Guided Tour & Buffet",
                    "description": "Experience Goa's lush hinterland with fragrant vanilla, pepper, and nutmeg walks.",
                    "duration": "3 hours",
                    "distance_from_hotel": "24 km (~35 mins)",
                    "budget": "₹600 per person"
                },
                "evening": {
                    "time": "06:00 PM - 09:30 PM",
                    "place": places.get("majorda-utorda-beach", {}),
                    "activity_title": "Sunset Relaxation at Alila Paddy Field Pool & Lounge",
                    "description": "Unwind overlooking the peaceful green paddy fields with artisanal cocktails at Edge Bar.",
                    "duration": "3 hours",
                    "distance_from_hotel": "At Resort",
                    "budget": "Resort menu"
                }
            },
            {
                "day_number": 4,
                "title": "Panjim Latin Quarter Photowalk & Mandovi Sunset Cruise",
                "theme": "Colonial Heritage & Arabian Sea Catamaran",
                "morning": {
                    "time": "09:00 AM - 12:30 PM",
                    "place": places.get("fontainhas-latin-quarter", {}),
                    "activity_title": "Photowalk through Fontainhas Latin Quarter Panjim",
                    "description": "Explore colorful cobblestone streets and heritage Portuguese villas with warm bakery treats.",
                    "duration": "2.5 hours",
                    "distance_from_hotel": "28 km (~45 mins)",
                    "budget": "Free walk + ₹200 bakery treats"
                },
                "afternoon": {
                    "time": "01:00 PM - 04:30 PM",
                    "place": places.get("basilica-bom-jesus-old-goa", {}),
                    "activity_title": "UNESCO World Heritage Cathedrals in Old Goa",
                    "description": "Visit the 16th-century Basilica of Bom Jesus holding sacred relics of St. Francis Xavier.",
                    "duration": "2.5 hours",
                    "distance_from_hotel": "27 km (~40 mins)",
                    "budget": "Free entry"
                },
                "evening": {
                    "time": "05:15 PM - 09:00 PM",
                    "place": places.get("mandovi-sunset-cruise", {}),
                    "activity_title": "Mandovi River Luxury Sunset Cruise",
                    "description": "Catamaran sunset sail with live Goan folk music and sparkling wine.",
                    "duration": "3 hours",
                    "distance_from_hotel": "29 km (~45 mins)",
                    "budget": "₹1,800 - ₹2,500 per person"
                }
            },
            {
                "day_number": 5,
                "title": "Alila Spa Rejuvenation & Farewell Goan Feast",
                "theme": "Ayurveda Wellness & Culinary Farewell",
                "morning": {
                    "time": "09:30 AM - 01:00 PM",
                    "place": places.get("majorda-utorda-beach", {}),
                    "activity_title": "Holistic Ayurvedic Wellness at Spa Alila",
                    "description": "Relax with indigenous herbal therapies and private courtyard plunge pools.",
                    "duration": "3 hours",
                    "distance_from_hotel": "At Resort",
                    "budget": "Spa menu"
                },
                "afternoon": {
                    "time": "01:30 PM - 04:30 PM",
                    "place": places.get("mobor-cavelossim-beach", {}),
                    "activity_title": "Afternoon Visit to Mobor Beach & Sal Estuary",
                    "description": "Take a scenic drive down south to admire uncrowded white sand dunes.",
                    "duration": "2.5 hours",
                    "distance_from_hotel": "18 km (~30 mins)",
                    "budget": "Free entry"
                },
                "evening": {
                    "time": "06:30 PM - 10:30 PM",
                    "place": places.get("martins-corner-betalbatim", {}),
                    "activity_title": "Grand Farewell Dinner at Martin's Corner",
                    "description": "Celebrate your Goan holiday with live acoustic music and King Crab Recheado.",
                    "duration": "3.5 hours",
                    "distance_from_hotel": "2.2 km (~5 mins)",
                    "budget": "₹₹₹ (₹1,700 for two)"
                }
            }
        ]

    else:
        # -------------------------------------------------------------
        # Default North Goa Itinerary: Taj Fort Aguada (Sinquerim, Candolim)
        # -------------------------------------------------------------
        day_plans = [
            {
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
            },
            {
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
            },
            {
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
            },
            {
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
            },
            {
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
        ]

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

    active_guest = guest_name.strip() if (guest_name and guest_name.strip()) else ""

    return {
        "hotel_id": active_h_id,
        "guest_name": active_guest,
        "hotel": hotel_name,
        "total_days": clamped_days,
        "start_date": base_date.strftime("%Y-%m-%d"),
        "itinerary": selected_plans,
        "summary": f"{clamped_days}-Day Curated Goa Itinerary starting from {hotel_name}, {hotel_area}."
    }
