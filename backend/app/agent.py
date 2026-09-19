import os
import json
import logging
import requests
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

from .tools import (
    CLAUDE_TOOLS,
    execute_tool,
    search_restaurants,
    search_activities,
    search_nearby_places,
    get_transport_tips,
    get_place_details,
    get_weather_and_tide_info,
    get_hotel_info
)

load_dotenv()
logger = logging.getLogger("ai_concierge.agent")

def get_system_prompt(hotel_id: str = "taj-fort-aguada", guest_name: Optional[str] = None, custom_trip: Optional[Dict[str, Any]] = None) -> str:
    """Generate a system prompt — universal for custom trips, Goa-specific for demo mode."""
    guest_intro = f"The esteemed guest is {guest_name.strip()}." if guest_name and guest_name.strip() else "The guest is our esteemed traveler."

    if custom_trip:
        dest = custom_trip.get("destination", "Unknown")
        dest_short = custom_trip.get("destination_short", dest)
        hotel_name = custom_trip.get("hotel_name", "My Hotel")
        weather = custom_trip.get("weather", {})
        weather_text = f"Current weather: {weather.get('temperature_c', 'N/A')}°C, {weather.get('condition', 'Unknown')}. Humidity: {weather.get('humidity', 'N/A')}. {weather.get('evening_forecast', '')}"

        return (
            f"You are the dedicated AI Trip Concierge for a guest staying at {hotel_name} in {dest}.\n"
            f"{guest_intro}\n"
            f"Destination: {dest}\n"
            f"{weather_text}\n\n"
            f"Critical Concierge Rules:\n"
            f"1. DESTINATION EXPERT: Provide accurate, specific recommendations for restaurants, attractions, activities in {dest_short}.\n"
            f"2. REAL & SPECIFIC: Recommend real places with pricing and distances.\n"
            f"3. WEATHER-AWARE: Contextualize advice to current weather.\n"
            f"4. TONE: Warm, polished, hospitable, and concise."
        )
    else:
        hotel = get_hotel_info(hotel_id)
        hotel_name = hotel.get("name", "Taj Fort Aguada Resort & Spa")
        hotel_area = hotel.get("area", "Sinquerim, Candolim")
        hotel_region = hotel.get("region", "North Goa")
        room_type = hotel.get("room_type", "Luxury Suite")
        conf_code = hotel.get("confirmation_code", "GOA-TAJ-89421")
        check_in_time = hotel.get("check_in_time", "3:00 PM")
        check_out_time = hotel.get("check_out_time", "12:00 PM")
        amenities_str = ", ".join(hotel.get("amenities", [])[:5])

        return (
            f"You are the exclusive 24/7 AI Trip Concierge for the guest staying at {hotel_name}, located in {hotel_area}, {hotel_region}.\n"
            f"{guest_intro} Active Reservation: {room_type} (Booking Reference: {conf_code}).\n"
            f"Hotel Info: Check-in: {check_in_time}, Check-out: {check_out_time}. Key Amenities: {amenities_str}.\n\n"
            f"Concierge Directives:\n"
            f"1. GEOGRAPHIC GROUNDING: When the guest asks for recommendations 'near me' or 'close to my stay', ALWAYS calculate from {hotel_name} in {hotel_area}.\n"
            f"2. AUTHENTIC EXPERIENCES: Always recommend real, verified Goa places with pricing, signature dishes, travel time, and insider tips.\n"
            f"3. TOOL CALLING: You have access to real tools: search_restaurants, search_activities, search_nearby_places, get_transport_tips, get_place_details, get_weather_and_tide_info.\n"
            f"4. TONE & HOSPITALITY: Warm, refined, hospitable, and actionable."
        )

class AIConciergeAgent:
    def __init__(self):
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.groq_key = os.getenv("GROQ_API_KEY")
        self.claude_client = None

        if self.anthropic_key and self.anthropic_key.strip() and not self.anthropic_key.startswith("your_"):
            try:
                import anthropic
                self.claude_client = anthropic.Anthropic(api_key=self.anthropic_key)
            except Exception as e:
                logger.warning(f"Failed to initialize Anthropic client: {e}")

    def chat(
        self,
        user_message: str,
        chat_history: Optional[List[Dict[str, str]]] = None,
        guest_name: Optional[str] = None,
        hotel_id: Optional[str] = "taj-fort-aguada",
        user_lat: Optional[float] = None,
        user_lng: Optional[float] = None,
        custom_trip: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Process user message using Claude native tool calling, other LLMs, or local fallback engine."""
        active_h_id = hotel_id or "taj-fort-aguada"
        history = chat_history or []

        # 1. Anthropic Claude (Native Tool Calling)
        if self.claude_client:
            try:
                return self._chat_claude(
                    user_message,
                    history,
                    guest_name=guest_name,
                    hotel_id=active_h_id,
                    user_lat=user_lat,
                    user_lng=user_lng,
                    custom_trip=custom_trip
                )
            except Exception as e:
                logger.warning(f"Claude API execution failed: {e}. Falling back to local AI engine.")

        # 2. Google Gemini (if configured)
        if self.gemini_key and self.gemini_key.strip() and not self.gemini_key.startswith("your_"):
            try:
                return self._chat_gemini(
                    user_message,
                    history,
                    guest_name=guest_name,
                    hotel_id=active_h_id,
                    user_lat=user_lat,
                    user_lng=user_lng,
                    custom_trip=custom_trip
                )
            except Exception as e:
                logger.warning(f"Gemini API error: {e}. Falling back to local AI engine.")

        # 3. Groq (if configured)
        if self.groq_key and self.groq_key.strip() and not self.groq_key.startswith("your_"):
            try:
                return self._chat_groq(
                    user_message,
                    history,
                    guest_name=guest_name,
                    hotel_id=active_h_id,
                    custom_trip=custom_trip
                )
            except Exception as e:
                logger.warning(f"Groq API error: {e}. Falling back to local AI engine.")

        # 4. Built-in Local AI Engine (100% Zero-Key Guarantee, Offline & Fast)
        return self._chat_fallback(
            user_message,
            history,
            guest_name=guest_name,
            hotel_id=active_h_id,
            user_lat=user_lat,
            user_lng=user_lng,
            custom_trip=custom_trip
        )

    def _chat_claude(
        self,
        user_message: str,
        chat_history: List[Dict[str, str]],
        guest_name: Optional[str] = None,
        hotel_id: str = "taj-fort-aguada",
        user_lat: Optional[float] = None,
        user_lng: Optional[float] = None,
        custom_trip: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute conversational flow with Anthropic Claude and native tool calling."""
        system_prompt = get_system_prompt(hotel_id, guest_name, custom_trip=custom_trip)
        hotel = get_hotel_info(hotel_id)
        hotel_name = hotel.get("name", "Taj Fort Aguada Resort & Spa")

        messages = []
        for msg in chat_history[-6:]:
            role = "user" if msg.get("role") == "user" else "assistant"
            messages.append({"role": role, "content": msg.get("content", "")})
        
        user_content = user_message
        if user_lat is not None and user_lng is not None:
            user_content += f"\n[Live GPS Location Context: Latitude {user_lat:.4f}, Longitude {user_lng:.4f}]"

        messages.append({"role": "user", "content": user_content})

        tool_calls_trace = []
        recommendation_cards = []

        response = self.claude_client.messages.create(
            model=os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022"),
            max_tokens=1024,
            system=system_prompt,
            tools=CLAUDE_TOOLS,
            messages=messages
        )

        if response.stop_reason == "tool_use":
            tool_use_blocks = [c for c in response.content if c.type == "tool_use"]
            assistant_content = response.content
            tool_result_messages = []

            for tool_block in tool_use_blocks:
                tool_name = tool_block.name
                tool_input = tool_block.input
                tool_use_id = tool_block.id

                tool_calls_trace.append({
                    "tool": tool_name,
                    "input": tool_input
                })

                tool_result = execute_tool(
                    tool_name,
                    tool_input,
                    hotel_id=hotel_id,
                    user_lat=user_lat,
                    user_lng=user_lng
                )
                
                if isinstance(tool_result, list):
                    for item in tool_result[:3]:
                        if isinstance(item, dict) and "name" in item and item not in recommendation_cards:
                            recommendation_cards.append(item)
                elif isinstance(tool_result, dict) and "name" in tool_result:
                    recommendation_cards.append(tool_result)

                tool_result_messages.append({
                    "type": "tool_result",
                    "tool_use_id": tool_use_id,
                    "content": json.dumps(tool_result, ensure_ascii=False)
                })

            messages.append({"role": "assistant", "content": assistant_content})
            messages.append({"role": "user", "content": tool_result_messages})

            followup_response = self.claude_client.messages.create(
                model=os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022"),
                max_tokens=1024,
                system=system_prompt,
                tools=CLAUDE_TOOLS,
                messages=messages
            )

            text_content = ""
            for block in followup_response.content:
                if hasattr(block, "text"):
                    text_content += block.text

            return {
                "reply": text_content,
                "tool_calls": tool_calls_trace,
                "cards": recommendation_cards,
                "provider": "Anthropic Claude 3.5 Sonnet",
                "hotel_origin": f"{hotel_name}, {hotel.get('area')}"
            }
        else:
            text_content = ""
            for block in response.content:
                if hasattr(block, "text"):
                    text_content += block.text

            return {
                "reply": text_content,
                "tool_calls": tool_calls_trace,
                "cards": recommendation_cards,
                "provider": "Anthropic Claude 3.5 Sonnet",
                "hotel_origin": f"{hotel_name}, {hotel.get('area')}"
            }

    def _chat_gemini(
        self,
        user_message: str,
        chat_history: List[Dict[str, str]],
        guest_name: Optional[str] = None,
        hotel_id: str = "taj-fort-aguada",
        user_lat: Optional[float] = None,
        user_lng: Optional[float] = None,
        custom_trip: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Call Google Gemini API with verified knowledge base context."""
        system_prompt = get_system_prompt(hotel_id, guest_name, custom_trip=custom_trip)
        hotel = get_hotel_info(hotel_id)
        hotel_name = hotel.get("name", "Taj Fort Aguada Resort & Spa")

        near_places = search_nearby_places(hotel_id=hotel_id, user_lat=user_lat, user_lng=user_lng, limit=4)
        knowledge_context = json.dumps({
            "hotel": hotel,
            "nearby_verified_places": near_places,
            "weather": get_weather_and_tide_info(hotel_id=hotel_id)
        }, ensure_ascii=False)

        prompt = (
            f"{system_prompt}\n\n"
            f"VERIFIED GOA KNOWLEDGE FOR THIS HOTEL STAY:\n{knowledge_context}\n\n"
            f"Guest Question: {user_message}\n\n"
            f"Provide a warm, personalized response referencing specific venues from the verified knowledge base:"
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.gemini_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.3, "maxOutputTokens": 1000}
        }
        res = requests.post(url, json=payload, timeout=12)
        if res.status_code == 200:
            data = res.json()
            reply_text = data["candidates"][0]["content"]["parts"][0]["text"]
            cards = near_places[:2]
            return {
                "reply": reply_text,
                "tool_calls": [{"tool": "search_nearby_places", "input": {"hotel_id": hotel_id}}],
                "cards": cards,
                "provider": "Google Gemini 2.0 Flash",
                "hotel_origin": f"{hotel_name}, {hotel.get('area')}"
            }
        else:
            raise Exception(f"Gemini API returned status {res.status_code}: {res.text}")

    def _chat_groq(
        self,
        user_message: str,
        chat_history: List[Dict[str, str]],
        guest_name: Optional[str] = None,
        hotel_id: str = "taj-fort-aguada",
        custom_trip: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Call Groq Cloud API with grounded context."""
        system_prompt = get_system_prompt(hotel_id, guest_name, custom_trip=custom_trip)
        hotel = get_hotel_info(hotel_id)
        hotel_name = hotel.get("name", "Taj Fort Aguada Resort & Spa")
        near_places = search_nearby_places(hotel_id=hotel_id, limit=3)
        
        headers = {"Authorization": f"Bearer {self.groq_key}", "Content-Type": "application/json"}
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": f"{system_prompt}\nVerified Places:\n{json.dumps(near_places)}"},
                {"role": "user", "content": user_message}
            ],
            "temperature": 0.3,
            "max_tokens": 800
        }
        res = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=10)
        if res.status_code == 200:
            data = res.json()
            reply_text = data["choices"][0]["message"]["content"]
            return {
                "reply": reply_text,
                "tool_calls": [{"tool": "search_nearby_places", "input": {"hotel_id": hotel_id}}],
                "cards": near_places[:2],
                "provider": "Groq LLaMA 3.3",
                "hotel_origin": f"{hotel_name}, {hotel.get('area')}"
            }
        raise Exception(f"Groq failed: {res.status_code}")

    def _chat_fallback(
        self,
        user_message: str,
        chat_history: List[Dict[str, str]],
        guest_name: Optional[str] = None,
        hotel_id: str = "taj-fort-aguada",
        user_lat: Optional[float] = None,
        user_lng: Optional[float] = None,
        custom_trip: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """High-intelligence local fallback concierge engine (Zero API Key required)."""
        msg = user_message.lower().strip()
        hotel = get_hotel_info(hotel_id)
        hotel_name = hotel.get("name", "Taj Fort Aguada Resort & Spa")
        hotel_area = hotel.get("area", "Sinquerim / Candolim")
        greeting = f"Namaste {guest_name.strip()}!" if guest_name and guest_name.strip() else "Namaste!"

        tool_calls_trace = []
        recommendation_cards = []
        reply_lines = []

        # Intent 1: Check-in / Arrival
        if any(w in msg for w in ["check-in", "checkin", "check in", "arrival", "before check-in", "luggage", "room key"]):
            reply_lines.append(f"{greeting} Here are the arrival details for your stay at **{hotel_name}**:\n")
            reply_lines.append(f"• **Check-in Time**: {hotel.get('check_in_time', '3:00 PM')} (Check-out: {hotel.get('check_out_time', '12:00 PM')})")
            reply_lines.append(f"• **Room Type**: {hotel.get('room_type', 'Luxury Suite')} (Ref: `{hotel.get('confirmation_code', 'GOA-TAJ-89421')}`)")
            reply_lines.append(f"• **Early Check-in & Luggage**: Our front desk offers secure luggage hold and immediate access to resort pools and beach lounges if you arrive early.")
            reply_lines.append(f"• **Required Documents**: Valid government ID and booking reference.")
            reply_lines.append(f"• **Highlights**: {', '.join(hotel.get('highlights', ['24/7 Concierge', 'Complimentary oceanfront refreshments']))}.")

        # Intent 2: Rain / Weather Adaptation ("Change my itinerary because of rain", "rain", "weather")
        elif any(w in msg for w in ["rain", "rainy", "storm", "weather", "bad weather", "monsoon", "itinerary because of rain"]):
            tool_input = {"hotel_id": hotel_id, "area": hotel_area}
            tool_calls_trace.append({"tool": "get_weather_and_tide_info", "input": tool_input})
            weather = get_weather_and_tide_info(hotel_id=hotel_id)

            tool_input_act = {"hotel_id": hotel_id, "category": "culture", "query": "museum heritage indoor"}
            tool_calls_trace.append({"tool": "search_activities", "input": tool_input_act})
            indoor_places = search_activities(**tool_input_act)
            recommendation_cards = indoor_places[:2]

            reply_lines.append(f"🌧️ **Weather-Adapted Concierge Plan for {hotel_name}**\n")
            reply_lines.append(f"I've updated your schedule with indoor cultural experiences and sheltered heritage dining:\n")
            if indoor_places:
                p1 = indoor_places[0]
                reply_lines.append(f"🏛️ **Indoor Highlight**: **{p1['name']}** ({p1['area']}) — {p1.get('distance_from_hotel', 'Near Hotel')}")
                reply_lines.append(f"• {p1.get('description')}")
            reply_lines.append(f"\n💡 *Concierge Tip*: Enjoy afternoon high tea and spa therapies at **{hotel_name}** while the passing shower clears over the Arabian Sea.")

        # Intent 3: "Where should I eat tonight?" / "dinner" / "food" / "restaurants" / "authentic goan food"
        elif any(w in msg for w in ["dinner", "lunch", "restaurant", "food", "eat", "dining", "hungry", "dish", "thali", "seafood", "authentic goan"]):
            cuisine_filter = ""
            if "seafood" in msg:
                cuisine_filter = "seafood"
            elif "thali" in msg or "authentic" in msg or "goan" in msg:
                cuisine_filter = "goan"
            elif "greek" in msg:
                cuisine_filter = "greek"

            tool_input = {
                "hotel_id": hotel_id,
                "query": cuisine_filter or "dinner",
                "near_hotel": True,
                "user_lat": user_lat,
                "user_lng": user_lng
            }
            tool_calls_trace.append({"tool": "search_restaurants", "input": tool_input})
            places = search_restaurants(**tool_input)

            if places:
                recommendation_cards = places[:2]
                primary = places[0]
                loc_label = "your current location" if (user_lat is not None and user_lng is not None) else f"your stay at {hotel_name}"
                reply_lines.append(f"Here are top dining recommendations calibrated to {loc_label}:\n")
                reply_lines.append(f"🍽️ **{primary['name']}**")
                reply_lines.append(f"• **Area**: {primary['area']} ({primary.get('distance_from_hotel', 'Near Hotel')})")
                reply_lines.append(f"• **Cuisine**: {primary.get('cuisine', 'Coastal Goan Seafood')}")
                reply_lines.append(f"• **Price**: {primary.get('price_range', '₹₹₹')}")
                reply_lines.append(f"• **Why Visit**: {primary.get('description')}")
                if primary.get("signature_dishes"):
                    reply_lines.append(f"• **Must-Try**: {', '.join(primary['signature_dishes'][:3])}")

                if len(places) > 1:
                    sec = places[1]
                    reply_lines.append(f"\n✨ *Alternative nearby spot*: **{sec['name']}** ({sec['area']}, {sec.get('distance_from_hotel')}) — {sec.get('vibe')}.")
                reply_lines.append(f"\nWould you like me to guide you with taxi directions or arrange priority reservations?")

        # Intent 4: "What beaches are near me?" / "beach" / "sea"
        elif any(w in msg for w in ["beach", "beaches", "sea", "sand", "swim", "chill beach", "morning beach"]):
            if user_lat is not None or "near" in msg:
                tool_input = {"hotel_id": hotel_id, "category": "beach", "user_lat": user_lat, "user_lng": user_lng, "limit": 4}
                tool_calls_trace.append({"tool": "search_nearby_places", "input": tool_input})
                beaches = search_nearby_places(**tool_input)
            else:
                tool_input = {"hotel_id": hotel_id, "category": "beach", "query": "beach", "user_lat": user_lat, "user_lng": user_lng}
                tool_calls_trace.append({"tool": "search_activities", "input": tool_input})
                beaches = search_activities(**tool_input)

            if beaches:
                recommendation_cards = beaches[:2]
                b1 = beaches[0]
                origin_text = "your live GPS location" if (user_lat is not None and user_lng is not None) else f"**{hotel_name}**"
                reply_lines.append(f"Here is the premier beach experience closest to {origin_text}:\n")
                reply_lines.append(f"🏖️ **{b1['name']}** ({b1['area']})")
                reply_lines.append(f"• **Distance**: {b1.get('distance_from_hotel', 'Near Hotel')}")
                reply_lines.append(f"• **Vibe & Atmosphere**: {b1.get('vibe')}")
                reply_lines.append(f"• **Best Time**: {b1.get('best_time')}")
                reply_lines.append(f"• **Highlights**: {b1.get('description')}")

                if len(beaches) > 1:
                    b2 = beaches[1]
                    reply_lines.append(f"\n💡 *Another scenic option*: **{b2['name']}** ({b2.get('distance_from_hotel')}) — {b2.get('vibe')}.")

        # Intent 5: "What is near me?" / "What can I do near me?" / "near me" / "explore area"
        elif any(w in msg for w in ["near me", "nearby", "around me", "close to me", "closest", "what can i do near", "explore area"]):
            tool_input = {"hotel_id": hotel_id, "user_lat": user_lat, "user_lng": user_lng, "limit": 4}
            tool_calls_trace.append({"tool": "search_nearby_places", "input": tool_input})
            nearby = search_nearby_places(**tool_input)
            recommendation_cards = nearby[:3]

            origin_text = "your live GPS location" if (user_lat is not None and user_lng is not None) else f"your hotel at {hotel_name}"
            reply_lines.append(f"📍 **Top Highlights Closest to {origin_text}**:\n")
            for item in nearby[:3]:
                reply_lines.append(f"• **{item['name']}** ({item['area']}) — *{item.get('distance_from_hotel', 'Nearby')}*")
                reply_lines.append(f"  {item.get('description')[:120]}...\n")
            reply_lines.append("Feel free to ask for directions or custom scheduling for any of these!")

        # Intent 6: "Plan my evening" / "evening" / "3 hours free" / "short itinerary"
        elif any(w in msg for w in ["evening", "plan my evening", "3 hours", "3 hour", "few hours", "afternoon plan"]):
            tool_calls_trace.append({"tool": "search_activities", "input": {"hotel_id": hotel_id, "time_of_day": "sunset"}})
            tool_calls_trace.append({"tool": "search_restaurants", "input": {"hotel_id": hotel_id, "query": "dinner", "near_hotel": True}})
            sunset_acts = search_activities(hotel_id=hotel_id, time_of_day="sunset")
            dinner_spots = search_restaurants(hotel_id=hotel_id, query="dinner", near_hotel=True)
            
            combined = (sunset_acts[:1] + dinner_spots[:1])
            recommendation_cards = combined

            reply_lines.append(f"🌅 **Curated 3-Hour Evening Plan from {hotel_name}**:\n")
            if sunset_acts:
                act = sunset_acts[0]
                reply_lines.append(f"1. **5:00 PM - 6:30 PM (Golden Hour)**: {act['name']} ({act.get('distance_from_hotel')}). {act.get('description')}")
            if dinner_spots:
                rest = dinner_spots[0]
                reply_lines.append(f"2. **7:00 PM - 8:30 PM (Dinner & Cocktails)**: {rest['name']} ({rest.get('distance_from_hotel')}). {rest.get('description')}")
            reply_lines.append(f"\nShall I provide transit estimates or taxi booking guidance for this evening route?")

        # Intent 7: Romantic evening
        elif any(w in msg for w in ["romantic", "couple", "date", "anniversary", "honeymoon"]):
            tool_calls_trace.append({"tool": "search_restaurants", "input": {"hotel_id": hotel_id, "vibe": "romantic"}})
            tool_calls_trace.append({"tool": "search_activities", "input": {"hotel_id": hotel_id, "query": "sunset"}})
            rom_rest = search_restaurants(hotel_id=hotel_id, vibe="romantic")
            rom_act = search_activities(hotel_id=hotel_id, query="sunset")
            recommendation_cards = (rom_act[:1] + rom_rest[:1])

            reply_lines.append(f"🕯️ **Exclusive Romantic Experience from {hotel_name}**:\n")
            if rom_act:
                reply_lines.append(f"• **Sunset Vista**: {rom_act[0]['name']} ({rom_act[0].get('distance_from_hotel')}) — {rom_act[0].get('vibe')}.")
            if rom_rest:
                reply_lines.append(f"• **Candlelight Dining**: {rom_rest[0]['name']} ({rom_rest[0].get('distance_from_hotel')}) — {rom_rest[0].get('description')}.")
            reply_lines.append("\nOur concierge can arrange priority candlelight seating with champagne for your evening.")

        # Intent 8: Transport / Travel ("How do I travel from Candolim to Panjim?", "taxi", "cab", "scooter")
        elif any(w in msg for w in ["travel", "how do i travel", "cab", "taxi", "scooter", "goamiles", "reach", "transport", "from"]):
            dest = "Panjim" if "panjim" in msg else ("Vagator" if "vagator" in msg else ("Baga" if "baga" in msg else ("Palolem" if "palolem" in msg else "Old Goa")))
            origin = hotel_area
            tool_input = {"hotel_id": hotel_id, "origin": origin, "destination": dest}
            tool_calls_trace.append({"tool": "get_transport_tips", "input": tool_input})
            guides = get_transport_tips(**tool_input)

            reply_lines.append(f"🚗 **Transit Guide from {origin} to {dest}**:\n")
            reply_lines.append(f"1. **GoaMiles App Taxi**: ~₹500 - ₹800. Government-regulated metered pricing with app tracking.")
            reply_lines.append(f"2. **Self-Drive Scooter / Activa**: ~₹400/day. Scenic, breezy, and flexible (Helmets required).")
            reply_lines.append(f"3. **Chauffeur Sedan**: ~₹2,500 for full-day private standby. Ideal for hassle-free day trips.")
            reply_lines.append(f"\nAsk the concierge desk at **{hotel_name}** anytime to arrange a doorstep vehicle delivery.")

        # General / Catch-all
        else:
            tool_input = {"hotel_id": hotel_id, "query": user_message, "limit": 3}
            tool_calls_trace.append({"tool": "search_nearby_places", "input": tool_input})
            results = search_nearby_places(**tool_input)
            recommendation_cards = results[:2]

            reply_lines.append(f"As your personal concierge at **{hotel_name}**, here are curated recommendations matching your request:\n")
            for item in results[:2]:
                reply_lines.append(f"• **{item['name']}** ({item['area']}, {item.get('distance_from_hotel', 'Near Hotel')}): {item.get('description')}")
            reply_lines.append(f"\nHow else may I enhance your Goa journey today?")

        return {
            "reply": "\n".join(reply_lines),
            "tool_calls": tool_calls_trace,
            "cards": recommendation_cards,
            "provider": "Local Concierge Mode (Zero-Key Grounded Engine)",
            "hotel_origin": f"{hotel_name}, {hotel_area}"
        }

agent_instance = AIConciergeAgent()
