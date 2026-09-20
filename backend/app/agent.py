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
                logger.info("✅ Anthropic Claude client initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize Anthropic client: {e}")
        else:
            logger.info(f"⚠️ ANTHROPIC_API_KEY not set or invalid — Claude disabled.")

        if self.gemini_key and self.gemini_key.strip() and not self.gemini_key.startswith("your_"):
            logger.info("✅ GEMINI_API_KEY detected — Gemini 2.0 Flash will be used as fallback.")
        else:
            logger.warning("⚠️ GEMINI_API_KEY not set — Gemini disabled. Will use local keyword engine.")

        if self.groq_key and self.groq_key.strip() and not self.groq_key.startswith("your_"):
            logger.info("✅ GROQ_API_KEY detected — Groq LLaMA available as fallback.")

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
        logger.info(f"[CHAT] hotel={active_h_id} | msg='{user_message[:60]}' | history_len={len(history)}")

        # 1. Anthropic Claude (Native Tool Calling)
        if self.claude_client:
            logger.info("[CHAT] Trying provider: Anthropic Claude")
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
                logger.warning(f"[CHAT] Claude API execution failed: {e}. Trying next provider.")

        # 2. Google Gemini (if configured)
        if self.gemini_key and self.gemini_key.strip() and not self.gemini_key.startswith("your_"):
            logger.info("[CHAT] Trying provider: Google Gemini 2.0 Flash")
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
                logger.warning(f"[CHAT] Gemini API error: {e}. Trying next provider.")

        # 3. Groq (if configured)
        if self.groq_key and self.groq_key.strip() and not self.groq_key.startswith("your_"):
            logger.info("[CHAT] Trying provider: Groq LLaMA")
            try:
                return self._chat_groq(
                    user_message,
                    history,
                    guest_name=guest_name,
                    hotel_id=active_h_id,
                    custom_trip=custom_trip
                )
            except Exception as e:
                logger.warning(f"[CHAT] Groq API error: {e}. Falling back to local engine.")

        # 4. Built-in Local Keyword Engine (Zero-Key Offline Fallback)
        logger.warning("[CHAT] No LLM API available — using local keyword-based fallback engine.")
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
        """Call Google Gemini API with verified knowledge base context and full chat history."""
        system_prompt = get_system_prompt(hotel_id, guest_name, custom_trip=custom_trip)
        hotel = get_hotel_info(hotel_id)
        hotel_name = hotel.get("name", "Taj Fort Aguada Resort & Spa")

        # Gather relevant context based on what user is asking
        near_places = search_nearby_places(hotel_id=hotel_id, user_lat=user_lat, user_lng=user_lng, limit=6)
        restaurants = search_restaurants(hotel_id=hotel_id)
        activities = search_activities(hotel_id=hotel_id)
        weather = get_weather_and_tide_info(hotel_id=hotel_id)

        knowledge_context = json.dumps({
            "hotel": hotel,
            "nearby_places": near_places,
            "restaurants": restaurants,
            "activities": activities,
            "weather": weather
        }, ensure_ascii=False)

        # Build multi-turn conversation history for Gemini
        contents = []

        # Add system context as the first user turn (Gemini doesn't have a system role)
        contents.append({
            "role": "user",
            "parts": [{
                "text": (
                    f"{system_prompt}\n\n"
                    f"VERIFIED DESTINATION KNOWLEDGE BASE:\n{knowledge_context}\n\n"
                    f"You are now ready to assist. Always answer the guest's SPECIFIC question directly "
                    f"using the knowledge base above. Do NOT give generic responses."
                )
            }]
        })
        contents.append({
            "role": "model",
            "parts": [{"text": "Understood. I'm ready to assist with specific, knowledge-based answers."}]
        })

        # Add previous conversation turns
        for msg in chat_history[-8:]:
            role = msg.get("role", "user")
            gemini_role = "user" if role == "user" else "model"
            contents.append({
                "role": gemini_role,
                "parts": [{"text": msg.get("content", "")}]
            })

        # Add current user message
        user_content = user_message
        if user_lat is not None and user_lng is not None:
            user_content += f"\n[Guest GPS: {user_lat:.4f}, {user_lng:.4f}]"
        contents.append({
            "role": "user",
            "parts": [{"text": user_content}]
        })

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.gemini_key}"
        payload = {
            "contents": contents,
            "generationConfig": {"temperature": 0.4, "maxOutputTokens": 1200}
        }
        res = requests.post(url, json=payload, timeout=15)
        if res.status_code == 200:
            data = res.json()
            reply_text = data["candidates"][0]["content"]["parts"][0]["text"]
            # Pick relevant cards based on what was asked
            cards = near_places[:2]
            return {
                "reply": reply_text,
                "tool_calls": [{"tool": "search_nearby_places", "input": {"hotel_id": hotel_id, "query": user_message[:50]}}],
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
        import re
        from .itinerary import generate_itinerary

        msg = user_message.lower().strip()
        hotel = get_hotel_info(hotel_id)
        hotel_name = hotel.get("name", "Taj Fort Aguada Resort & Spa")
        hotel_area = hotel.get("area", "Sinquerim / Candolim")
        greeting = f"Namaste {guest_name.strip()}!" if guest_name and guest_name.strip() else "Namaste!"

        tool_calls_trace = []
        recommendation_cards = []
        reply_lines = []

        # Intent 0: Multi-day Itinerary / Travel Plan ("3 day plan", "plan 3 days", "itinerary", "trip plan", "schedule")
        plan_keywords = ["day plan", "days plan", "day itinerary", "days itinerary", "itinerary", "trip plan", "plan my trip", "plan my day", "what should i do in goa", "things to do in goa", "schedule for", "tour plan"]
        is_plan_query = any(k in msg for k in plan_keywords) or (("plan" in msg or "guide" in msg or "tour" in msg) and any(f"{n} day" in msg or f"{n}-day" in msg or f"{n} days" in msg for n in range(1, 8)))

        if is_plan_query:
            # Extract number of days requested (default to 3)
            num_days = 3
            day_match = re.search(r'\b([1-5])\s*(?:day|days|-day)\b', msg)
            if day_match:
                try:
                    num_days = int(day_match.group(1))
                except Exception:
                    num_days = 3
            elif "one day" in msg or "1 day" in msg:
                num_days = 1
            elif "two day" in msg or "2 day" in msg:
                num_days = 2
            elif "four day" in msg or "4 day" in msg:
                num_days = 4
            elif "five day" in msg or "5 day" in msg:
                num_days = 5

            num_days = max(1, min(num_days, 5))

            tool_input = {"hotel_id": hotel_id, "days": num_days, "guest_name": guest_name}
            tool_calls_trace.append({"tool": "generate_itinerary", "input": tool_input})
            itinerary_data = generate_itinerary(hotel_id=hotel_id, days=num_days, guest_name=guest_name)
            days_list = itinerary_data.get("itinerary", [])

            reply_lines.append(f"🌴 **{greeting} Here is your Curated {num_days}-Day Goa Itinerary starting from {hotel_name}**:\n")

            for day in days_list:
                d_num = day.get("day_number", 1)
                d_title = day.get("title", f"Day {d_num}")
                d_theme = day.get("theme", "Exploration & Leisure")
                reply_lines.append(f"### 📅 **Day {d_num}: {d_title}** (*{d_theme}*)")

                m = day.get("morning", {})
                if m:
                    m_title = m.get("activity_title") or m.get("title", "Morning Exploration")
                    m_desc = m.get("description", "")
                    m_time = m.get("time", "Morning")
                    reply_lines.append(f"• 🌅 **Morning ({m_time})**: **{m_title}**\n  {m_desc}")
                    if m.get("place") and isinstance(m.get("place"), dict) and m["place"].get("id"):
                        if len(recommendation_cards) < 3 and m["place"] not in recommendation_cards:
                            recommendation_cards.append(m["place"])

                a = day.get("afternoon", {})
                if a:
                    a_title = a.get("activity_title") or a.get("title", "Afternoon Discovery")
                    a_desc = a.get("description", "")
                    a_time = a.get("time", "Afternoon")
                    reply_lines.append(f"• ☀️ **Afternoon ({a_time})**: **{a_title}**\n  {a_desc}")
                    if a.get("place") and isinstance(a.get("place"), dict) and a["place"].get("id"):
                        if len(recommendation_cards) < 3 and a["place"] not in recommendation_cards:
                            recommendation_cards.append(a["place"])

                e = day.get("evening", {})
                if e:
                    e_title = e.get("activity_title") or e.get("title", "Evening Romance & Dining")
                    e_desc = e.get("description", "")
                    e_time = e.get("time", "Evening")
                    reply_lines.append(f"• 🌙 **Evening ({e_time})**: **{e_title}**\n  {e_desc}")
                    if e.get("place") and isinstance(e.get("place"), dict) and e["place"].get("id"):
                        if len(recommendation_cards) < 3 and e["place"] not in recommendation_cards:
                            recommendation_cards.append(e["place"])

                reply_lines.append("")

            reply_lines.append("💡 *Concierge Tip*: You can also review this day-by-day plan with live weather maps and sync it to Google Calendar under the **My Trips** tab!")

            if not recommendation_cards:
                nearby = search_nearby_places(hotel_id=hotel_id, limit=2)
                recommendation_cards = nearby[:2]

        # Intent 1: Check-in / Arrival / Stay Info
        elif any(w in msg for w in ["check-in", "checkin", "check in", "arrival", "before check-in", "luggage", "room key", "wifi", "amenities", "pool timing", "checkout", "check-out"]):
            reply_lines.append(f"{greeting} Here are the stay details for **{hotel_name}**:\n")
            reply_lines.append(f"• **Check-in Time**: {hotel.get('check_in_time', '3:00 PM')} | **Check-out**: {hotel.get('check_out_time', '12:00 PM')}")
            reply_lines.append(f"• **Room Category**: {hotel.get('room_type', 'Luxury Suite')} (Booking Ref: `{hotel.get('confirmation_code', 'GOA-TAJ-89421')}`)")
            reply_lines.append(f"• **Early Check-in & Luggage**: Complimentary secure luggage hold is available. You may enjoy the resort pools, beachfront lawns, and lounge while your suite is readied.")
            reply_lines.append(f"• **Key Amenities**: {', '.join(hotel.get('amenities', ['Infinity Pool', '24/7 Concierge', 'Spa', 'Private Beach Access']))}.")
            reply_lines.append(f"• **Concierge Desk**: Located at the main lobby — we can arrange scooters, chauffeur sedans, and spa bookings at any time.")

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
            reply_lines.append(f"I've curated sheltered heritage experiences and indoor coastal dining for you:\n")
            if indoor_places:
                p1 = indoor_places[0]
                reply_lines.append(f"🏛️ **Indoor Highlight**: **{p1['name']}** ({p1['area']}) — {p1.get('distance_from_hotel', 'Near Hotel')}")
                reply_lines.append(f"• {p1.get('description')}")
            reply_lines.append(f"\n💡 *Concierge Tip*: Enjoy afternoon high tea and spa therapies at **{hotel_name}** while the passing shower clears over the Arabian Sea.")

        # Intent 3: Nightlife / Parties / Sunset Lounges / Clubs
        elif any(w in msg for w in ["party", "nightlife", "club", "pub", "bar", "cocktail", "cocktails", "dj", "dance", "sunset party", "night out"]):
            tool_calls_trace.append({"tool": "search_activities", "input": {"hotel_id": hotel_id, "category": "nightlife"}})
            nl_places = search_activities(hotel_id=hotel_id, category="nightlife")
            if not nl_places:
                nl_places = search_activities(hotel_id=hotel_id, query="sunset party")
            
            recommendation_cards = nl_places[:2]
            reply_lines.append(f"🍸 **Top Nightlife & Sunset Lounges near {hotel_name}**:\n")
            for item in nl_places[:2]:
                reply_lines.append(f"• **{item['name']}** ({item['area']} — {item.get('distance_from_hotel', 'Nearby')})")
                reply_lines.append(f"  {item.get('description')}")
                if item.get("vibe"):
                    reply_lines.append(f"  *Vibe*: {item.get('vibe')}\n")
            reply_lines.append("💡 *Tip*: We recommend arriving by 5:15 PM for sunset tables or reserving ahead for weekend DJ sets.")

        # Intent 4: Heritage / Sightseeing / Forts / Churches / Culture
        elif any(w in msg for w in ["fort", "church", "sightseeing", "history", "heritage", "museum", "culture", "monument", "places to see", "attraction", "old goa", "fontainhas"]):
            tool_calls_trace.append({"tool": "search_activities", "input": {"hotel_id": hotel_id, "category": "culture"}})
            heritage_places = search_activities(hotel_id=hotel_id, category="culture")
            recommendation_cards = heritage_places[:2]

            reply_lines.append(f"🏛️ **Curated Heritage & Sightseeing from {hotel_name}**:\n")
            for item in heritage_places[:2]:
                reply_lines.append(f"• **{item['name']}** ({item['area']} — {item.get('distance_from_hotel', 'Near Hotel')})")
                reply_lines.append(f"  {item.get('description')}")
                if item.get("best_time"):
                    reply_lines.append(f"  *Best Time*: {item.get('best_time')}\n")
            reply_lines.append("Would you like our concierge to arrange a private chauffeur sedan for this heritage trail?")

        # Intent 5: Adventure / Water Sports / Kayaking / Scuba
        elif any(w in msg for w in ["water sport", "watersports", "parasailing", "scuba", "jet ski", "kayak", "dolphin", "boat", "adventure", "trek"]):
            tool_calls_trace.append({"tool": "search_activities", "input": {"hotel_id": hotel_id, "query": "water sports"}})
            adv_places = search_activities(hotel_id=hotel_id, query="water sports")
            if not adv_places:
                adv_places = search_nearby_places(hotel_id=hotel_id, category="beach")
            recommendation_cards = adv_places[:2]

            reply_lines.append(f"🏄 **Premier Water Sports & Coastal Adventures near {hotel_name}**:\n")
            for item in adv_places[:2]:
                reply_lines.append(f"• **{item['name']}** ({item['area']}) — *{item.get('distance_from_hotel', 'Near Hotel')}*")
                reply_lines.append(f"  {item.get('description')}")
            reply_lines.append("\n💡 *Safety Tip*: Water sports operate daily between 9:00 AM and 5:00 PM subject to ocean swim flags.")

        # Intent 6: Dining / Restaurants / Cafes / Seafood / Goan Food
        elif any(w in msg for w in ["dinner", "lunch", "restaurant", "food", "eat", "dining", "hungry", "dish", "thali", "seafood", "authentic goan", "cafe", "breakfast"]):
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

            if not places:
                places = search_restaurants(hotel_id=hotel_id, query="goan")

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

        # Intent 7: Beaches / Sunsets / Swimming
        elif any(w in msg for w in ["beach", "beaches", "sea", "sand", "swim", "chill beach", "morning beach", "sunset"]):
            tool_input = {"hotel_id": hotel_id, "category": "beach", "user_lat": user_lat, "user_lng": user_lng, "limit": 4}
            tool_calls_trace.append({"tool": "search_nearby_places", "input": tool_input})
            beaches = search_nearby_places(**tool_input)
            if not beaches:
                beaches = search_activities(hotel_id=hotel_id, category="beach")

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

        # Intent 8: Romantic Evening / Couples
        elif any(w in msg for w in ["romantic", "couple", "date", "anniversary", "honeymoon"]):
            tool_calls_trace.append({"tool": "search_restaurants", "input": {"hotel_id": hotel_id, "vibe": "romantic"}})
            rom_rest = search_restaurants(hotel_id=hotel_id, vibe="romantic")
            rom_act = search_activities(hotel_id=hotel_id, query="sunset")
            recommendation_cards = (rom_act[:1] + rom_rest[:1])

            reply_lines.append(f"🕯️ **Exclusive Romantic Experience from {hotel_name}**:\n")
            if rom_act:
                reply_lines.append(f"• **Sunset Vista**: {rom_act[0]['name']} ({rom_act[0].get('distance_from_hotel')}) — {rom_act[0].get('vibe')}.")
            if rom_rest:
                reply_lines.append(f"• **Candlelight Dining**: {rom_rest[0]['name']} ({rom_rest[0].get('distance_from_hotel')}) — {rom_rest[0].get('description')}.")
            reply_lines.append("\nOur concierge can arrange priority candlelight seating with champagne for your evening.")

        # Intent 9: Transport / Transit ("How do I travel from Candolim to Panjim?", "taxi", "cab", "scooter")
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

        # Intent 10: General / Exploration / Catch-All
        # Attempts a smart, question-aware response using all available data
        else:
            # Gather broad context to answer the question
            all_places = search_nearby_places(hotel_id=hotel_id, limit=6)
            all_restaurants = search_restaurants(hotel_id=hotel_id)
            all_activities = search_activities(hotel_id=hotel_id)
            weather = get_weather_and_tide_info(hotel_id=hotel_id)

            tool_input = {"hotel_id": hotel_id, "query": user_message, "limit": 3}
            tool_calls_trace.append({"tool": "search_nearby_places", "input": tool_input})
            results = search_nearby_places(**tool_input)
            if not results:
                results = all_places[:3]

            recommendation_cards = results[:2]

            # Build a meaningful, question-aware answer instead of a generic template
            # Check what the user is likely asking about from keywords in the question
            msg_lower = user_message.lower()

            # Try to craft a relevant answer using available data
            reply_lines.append(f"{greeting} Regarding your question about **\"{user_message.strip()}\"** —\n")

            # Are they asking about something specific we can answer?
            if any(w in msg_lower for w in ["how", "what", "when", "where", "can i", "do you", "is there", "tell me", "suggest"]):
                # Try to give a contextual answer with real data
                if any(w in msg_lower for w in ["open", "timing", "hours", "time"]):
                    reply_lines.append(f"Most attractions and restaurants in Goa operate between **9:00 AM – 10:00 PM**.\n")
                    reply_lines.append(f"Beach shacks typically open from **8:00 AM to midnight** during the season.\n")
                    if results:
                        reply_lines.append(f"Near **{hotel_name}**, you may enjoy:")
                        for item in results[:2]:
                            reply_lines.append(f"• **{item['name']}** ({item.get('distance_from_hotel', 'Nearby')}) — {item.get('description', '')}")
                elif any(w in msg_lower for w in ["cost", "price", "fee", "charge", "how much", "budget", "expensive", "cheap"]):
                    reply_lines.append(f"Here's a quick budget guide from **{hotel_name}**:\n")
                    reply_lines.append(f"• 🚗 **Taxi/Cab** (GoaMiles): ₹200 – ₹800 per trip")
                    reply_lines.append(f"• 🛵 **Scooter Rental**: ₹300 – ₹500/day")
                    reply_lines.append(f"• 🍽️ **Dining**: ₹300 – ₹1,500 per person (beach shack to fine dining)")
                    reply_lines.append(f"• 🏄 **Water Sports**: ₹500 – ₹2,000 per activity")
                    reply_lines.append(f"• 🏛️ **Entry Fees**: Most Goa heritage sites are free or ₹15 – ₹50")
                elif any(w in msg_lower for w in ["best", "top", "recommend", "suggest", "popular", "must"]):
                    reply_lines.append(f"Here are some top highlights near **{hotel_name}**:\n")
                    for item in (results + all_activities[:2])[:3]:
                        name = item.get('name', '')
                        area = item.get('area', '')
                        dist = item.get('distance_from_hotel', 'Nearby')
                        desc = item.get('description', '')
                        reply_lines.append(f"• **{name}** ({area} — {dist})")
                        reply_lines.append(f"  {desc}\n")
                else:
                    # Generic question — give a full overview
                    reply_lines.append(f"As your concierge at **{hotel_name}**, let me give you a curated overview:\n")
                    if all_places:
                        reply_lines.append("**Nearby Highlights:**")
                        for item in all_places[:2]:
                            reply_lines.append(f"• **{item['name']}** ({item.get('distance_from_hotel', 'Nearby')}) — {item.get('description', '')}")
                    if all_restaurants:
                        r = all_restaurants[0]
                        reply_lines.append(f"\n**Top Dining Pick**: **{r['name']}** ({r.get('area')}) — {r.get('description', '')}")
                    if weather:
                        reply_lines.append(f"\n**Current Weather**: {weather.get('condition', 'Sunny')}, {weather.get('temperature', 'Warm')}")
            else:
                # Truly ambiguous — show curated highlights and invite follow-up
                reply_lines.append(f"Here are some highlights I'd recommend near **{hotel_name}**:\n")
                for item in results[:3]:
                    reply_lines.append(f"• **{item['name']}** ({item['area']} — *{item.get('distance_from_hotel', 'Near Hotel')}*)")
                    reply_lines.append(f"  {item.get('description')}\n")

            reply_lines.append(f"\n💬 Feel free to ask me anything specific — restaurants, beaches, water sports, transport, or a full day plan!")            

        return {
            "reply": "\n".join(reply_lines),
            "tool_calls": tool_calls_trace,
            "cards": recommendation_cards,
            "provider": "Local Concierge Mode (Zero-Key Grounded Engine)",
            "hotel_origin": f"{hotel_name}, {hotel_area}"
        }

agent_instance = AIConciergeAgent()

