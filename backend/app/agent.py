import os
import json
import logging
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

from .tools import (
    CLAUDE_TOOLS,
    execute_tool,
    search_restaurants,
    search_activities,
    get_transport_tips,
    get_place_details,
    get_weather_and_tide_info,
    get_hotel_info
)

load_dotenv()
logger = logging.getLogger("ai_concierge.agent")

def get_system_prompt(hotel_id: str = "taj-fort-aguada", guest_name: Optional[str] = None) -> str:
    hotel = get_hotel_info(hotel_id)
    hotel_name = hotel.get("name", "Taj Fort Aguada Resort & Spa, Goa")
    hotel_area = hotel.get("area", "Sinquerim, Candolim")
    hotel_region = hotel.get("region", "North Goa")
    room_type = hotel.get("room_type", "Luxury Suite")
    conf_code = hotel.get("confirmation_code", "CONF-DEMO")
    check_in_time = hotel.get("check_in_time", "3:00 PM")
    check_out_time = hotel.get("check_out_time", "12:00 PM")
    amenities_str = ", ".join(hotel.get("amenities", [])[:5])

    guest_intro = f"The esteemed guest is {guest_name.strip()}." if guest_name and guest_name.strip() else "The guest is our esteemed traveler."
    
    return (
        f"You are the exclusive AI Trip Concierge for the guest staying at {hotel_name}, located in {hotel_area}, {hotel_region}.\n"
        f"{guest_intro} Reservation: {room_type} (Confirmation: {conf_code}).\n"
        f"Hotel Details: Check-in: {check_in_time}, Check-out: {check_out_time}. Key Amenities: {amenities_str}.\n\n"
        f"Crucial Concierge Guidelines:\n"
        f"1. GEOGRAPHIC GROUNDING: When the guest asks for recommendations 'near me', 'nearby', 'near my hotel', or 'close to my stay', ALWAYS use {hotel_name} in {hotel_area} as the origin.\n"
        f"2. HOTEL CONTEXT: Never confuse this hotel with any other property. Do not recommend Candolim spots as 'nearby' if the guest is staying at The Leela in South Goa or W Goa in Vagator.\n"
        f"3. AUTHENTIC KNOWLEDGE: Always call tools (search_restaurants, search_activities, get_transport_tips, get_weather_and_tide_info) to retrieve authentic Goa knowledge. Never invent fake venues.\n"
        f"4. CHECK-IN INQUIRIES: When asked about check-in guidance, provide check-in time ({check_in_time}), check-out time ({check_out_time}), digital key services, welcome amenities, and luggage storage assistance.\n"
        f"5. TONE & HOSPITALITY: Keep responses warm, polished, hospitable, and concise. Address the guest warmly."
    )

class AIConciergeAgent:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        self.client = None
        if self.api_key and self.api_key.strip() and not self.api_key.startswith("your_"):
            try:
                import anthropic
                self.client = anthropic.Anthropic(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize Anthropic client: {e}")
                self.client = None

    def chat(
        self,
        user_message: str,
        chat_history: Optional[List[Dict[str, str]]] = None,
        guest_name: Optional[str] = None,
        hotel_id: Optional[str] = "taj-fort-aguada"
    ) -> Dict[str, Any]:
        """Process user message via Claude tool-use, falling back to smart local tool calling if API key is missing."""
        active_h_id = hotel_id or "taj-fort-aguada"
        if self.client:
            try:
                return self._chat_claude(user_message, chat_history or [], guest_name=guest_name, hotel_id=active_h_id)
            except Exception as e:
                logger.error(f"Claude API execution failed: {e}. Falling back to offline tool engine.")
                return self._chat_fallback(user_message, chat_history or [], guest_name=guest_name, hotel_id=active_h_id)
        else:
            return self._chat_fallback(user_message, chat_history or [], guest_name=guest_name, hotel_id=active_h_id)

    def _chat_claude(
        self,
        user_message: str,
        chat_history: List[Dict[str, str]],
        guest_name: Optional[str] = None,
        hotel_id: str = "taj-fort-aguada"
    ) -> Dict[str, Any]:
        """Execute conversational flow with Anthropic Claude and tool calling."""
        system_prompt = get_system_prompt(hotel_id, guest_name)
        hotel = get_hotel_info(hotel_id)
        hotel_name = hotel.get("name", "Taj Fort Aguada")

        messages = []
        for msg in chat_history[-6:]:
            role = "user" if msg.get("role") == "user" else "assistant"
            messages.append({"role": role, "content": msg.get("content", "")})
        
        messages.append({"role": "user", "content": user_message})

        tool_calls_trace = []
        recommendation_cards = []

        # First call to Claude
        response = self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            system=system_prompt,
            tools=CLAUDE_TOOLS,
            messages=messages
        )

        # Check if Claude called tools
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

                # Execute local tool with hotel context
                tool_result = execute_tool(tool_name, tool_input, hotel_id=hotel_id)
                
                # If tool returned places or restaurant data, collect as cards
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

            # Follow up call with tool results
            messages.append({"role": "assistant", "content": assistant_content})
            messages.append({"role": "user", "content": tool_result_messages})

            followup_response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
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
                "provider": "Anthropic Claude 3.5 Sonnet (Live API)",
                "hotel_origin": f"{hotel_name}, {hotel.get('area')}"
            }
        else:
            # Direct text response
            text_content = ""
            for block in response.content:
                if hasattr(block, "text"):
                    text_content += block.text

            return {
                "reply": text_content,
                "tool_calls": tool_calls_trace,
                "cards": recommendation_cards,
                "provider": "Anthropic Claude 3.5 Sonnet (Live API)",
                "hotel_origin": f"{hotel_name}, {hotel.get('area')}"
            }

    def _chat_fallback(
        self,
        user_message: str,
        chat_history: List[Dict[str, str]],
        guest_name: Optional[str] = None,
        hotel_id: str = "taj-fort-aguada"
    ) -> Dict[str, Any]:
        """Intelligent semantic tool dispatcher fallback grounded in active hotel context."""
        msg = user_message.lower().strip()
        hotel = get_hotel_info(hotel_id)
        hotel_name = hotel.get("name", "Taj Fort Aguada")
        hotel_area = hotel.get("area", "Candolim")
        
        tool_calls_trace = []
        recommendation_cards = []
        reply_lines = []
        greeting = f"Namaste {guest_name.strip()}!" if guest_name and guest_name.strip() else "Namaste!"

        # Intent 1: Check-in guidance
        if any(w in msg for w in ["check-in", "checkin", "check in", "arrival", "before check-in", "luggage", "room key"]):
            reply_lines.append(f"{greeting} Here is everything you should know regarding your stay at **{hotel_name}**:\n")
            reply_lines.append(f"• **Check-in Time**: {hotel.get('check_in_time', '3:00 PM')} (Check-out: {hotel.get('check_out_time', '12:00 PM')})")
            reply_lines.append(f"• **Room Type**: {hotel.get('room_type', 'Luxury Suite')} (Ref: `{hotel.get('confirmation_code', 'CONF-DEMO')}`)")
            reply_lines.append(f"• **Early Arrival & Luggage**: Our concierge desk is delighted to store your luggage securely and grant pool & beach lounge access if you arrive before standard check-in.")
            reply_lines.append(f"• **Required at Check-in**: Valid government photo ID and booking confirmation reference.")
            reply_lines.append(f"• **Key Highlights & Perks**: {', '.join(hotel.get('highlights', ['24/7 Concierge', 'Complimentary welcome refreshment']))}.")
            reply_lines.append(f"\nFeel free to ask me for dining or activity arrangements while your suite is being finalized!")

        # Intent 2: Dinner / Restaurant near me
        elif any(w in msg for w in ["dinner", "lunch", "restaurant", "food", "eat", "dining", "hungry", "dish"]):
            is_near = any(w in msg for w in ["near", "nearby", "around", "closest", "tonight", "here", "hotel"])
            cuisine_filter = ""
            if "seafood" in msg:
                cuisine_filter = "seafood"
            elif "south indian" in msg or "thali" in msg:
                cuisine_filter = "south indian"
            elif "greek" in msg:
                cuisine_filter = "greek"

            area_filter = ""
            if "cavelossim" in msg:
                area_filter = "Cavelossim"
            elif "majorda" in msg or "betalbatim" in msg:
                area_filter = "Betalbatim"
            elif "vagator" in msg:
                area_filter = "Vagator"
            elif "baga" in msg:
                area_filter = "Baga"
            elif "assagao" in msg:
                area_filter = "Assagao"
            elif "siolim" in msg:
                area_filter = "Siolim"
            elif "calangute" in msg:
                area_filter = "Calangute"
            elif "panjim" in msg:
                area_filter = "Panjim"

            tool_input = {
                "hotel_id": hotel_id,
                "query": cuisine_filter or "dinner",
                "area": area_filter,
                "near_hotel": is_near or not area_filter
            }
            tool_calls_trace.append({"tool": "search_restaurants", "input": tool_input})
            places = search_restaurants(**tool_input)

            if places:
                recommendation_cards = places[:2]
                primary = places[0]
                reply_lines.append(f"Here is a top dining recommendation near your stay at **{hotel_name}** ({hotel_area}):\n")
                reply_lines.append(f"🍽️ **{primary['name']}**")
                reply_lines.append(f"• **Area**: {primary['area']} ({primary.get('distance_from_hotel', 'Near Hotel')})")
                reply_lines.append(f"• **Cuisine**: {primary.get('cuisine', 'Coastal')}")
                reply_lines.append(f"• **Price Range**: {primary.get('price_range', '₹₹')}")
                reply_lines.append(f"• **Why Visit**: {primary.get('description')}")
                if "signature_dishes" in primary and primary["signature_dishes"]:
                    reply_lines.append(f"• **Must-Try**: {', '.join(primary['signature_dishes'][:3])}")

                if len(places) > 1:
                    secondary = places[1]
                    reply_lines.append(f"\nAlternatively:\n• **{secondary['name']}** ({secondary.get('distance_from_hotel')}) — {secondary.get('vibe')}.")
                
                reply_lines.append(f"\nWould you like our concierge team to coordinate priority table reservations for you?")
            else:
                reply_lines.append(f"I checked our verified Goa directory and recommend dining at the seaside spots located right near {hotel_name}.")

        # Intent 3: Chill beach / morning beach / close to my stay
        elif any(w in msg for w in ["beach", "sea", "sand", "swim", "chill beach", "morning beach", "close to my stay"]):
            tool_input = {"hotel_id": hotel_id, "query": "chill beach", "category": "beach", "time_of_day": "morning"}
            tool_calls_trace.append({"tool": "search_activities", "input": tool_input})
            beaches = search_activities(**tool_input)
            
            selected = beaches
            if selected:
                recommendation_cards = selected[:2]
                primary = selected[0]

                reply_lines.append(f"For a serene beach experience close to **{hotel_name}**, here is my top recommendation:\n")
                reply_lines.append(f"🏖️ **{primary['name']}**")
                reply_lines.append(f"• **Location**: {primary['area']} ({primary.get('distance_from_hotel', 'Near Hotel')})")
                reply_lines.append(f"• **Atmosphere**: {primary.get('vibe')}")
                reply_lines.append(f"• **Best Time**: {primary.get('best_time')}")
                reply_lines.append(f"• **Why Visit**: {primary.get('description')}")
                
                if len(selected) > 1:
                    sec = selected[1]
                    reply_lines.append(f"\n💡 *Another nearby option*: **{sec['name']}** ({sec.get('distance_from_hotel')}) — {sec.get('vibe')}.")

        # Intent 4: What can I do near my hotel / Tomorrow's activities
        elif any(w in msg for w in ["do near", "near my hotel", "tomorrow", "plan tomorrow", "what can i do"]):
            tool_input = {"hotel_id": hotel_id, "query": "activities"}
            tool_calls_trace.append({"tool": "search_activities", "input": tool_input})
            activities = search_activities(**tool_input)
            recommendation_cards = activities[:2]

            reply_lines.append(f"Here are exciting experiences starting right from **{hotel_name}** ({hotel_area}):\n")
            for act in activities[:2]:
                reply_lines.append(f"✨ **{act['name']}** ({act['area']})")
                reply_lines.append(f"• **Distance**: {act.get('distance_from_hotel', 'Near Hotel')}")
                reply_lines.append(f"• **Vibe**: {act.get('vibe')}")
                reply_lines.append(f"• **Experience**: {act.get('description')}\n")
            reply_lines.append("Would you like me to add any of these to your customized daily itinerary?")

        # Intent 5: Transport / Travel advice
        elif any(w in msg for w in ["travel", "go to", "cab", "taxi", "scooter", "goamiles", "reach", "transport", "how can i"]):
            destination = "Panjim" if "panjim" in msg else ("Baga" if "baga" in msg else ("Palolem" if "palolem" in msg else "Old Goa"))
            origin = f"{hotel_name}, {hotel_area}"
            tool_input = {"hotel_id": hotel_id, "origin": origin, "destination": destination}
            tool_calls_trace.append({"tool": "get_transport_tips", "input": tool_input})
            guides = get_transport_tips(**tool_input)

            reply_lines.append(f"Here is the best way to travel from **{origin}** to **{destination}**:\n")
            reply_lines.append(f"1. 🚗 **GoaMiles App Cab**: Most reliable government-regulated meter pricing. Download the GoaMiles app or ask the hotel concierge desk to arrange a pickup.")
            reply_lines.append(f"2. 🛵 **Scooter / Activa Rental**: (~₹400/day). Scenic and flexible for beach hops within 15 km. Helmets are mandatory.")
            reply_lines.append(f"3. 🚘 **Private Chauffeur Sedan**: (~₹2,500 for 8 hrs). Ideal for stress-free day tours across South or North Goa.")

        # Intent 6: Romantic evening
        elif any(w in msg for w in ["romantic", "couple", "date", "anniversary", "sunset"]):
            tool_input = {"hotel_id": hotel_id, "query": "romantic sunset", "vibe": "romantic", "near_hotel": True}
            tool_calls_trace.append({"tool": "search_restaurants", "input": tool_input})
            rom_restaurants = search_restaurants(**tool_input)
            tool_calls_trace.append({"tool": "search_activities", "input": {"hotel_id": hotel_id, "query": "sunset"}})
            rom_activities = search_activities(hotel_id=hotel_id, query="sunset")

            combined_cards = (rom_restaurants[:1] + rom_activities[:1])
            recommendation_cards = combined_cards

            reply_lines.append(f"Here is a curated romantic evening tailored from **{hotel_name}**:\n")
            if rom_activities:
                act = rom_activities[0]
                reply_lines.append(f"1. 🌅 **Golden Hour ({act['name']})**: {act['description']} ({act.get('distance_from_hotel')}).")
            if rom_restaurants:
                rest = rom_restaurants[0]
                reply_lines.append(f"2. 🕯️ **Intimate Dinner at {rest['name']} ({rest['area']})**: {rest['description']} ({rest.get('distance_from_hotel')}).")
            reply_lines.append(f"\nShall I have our hotel concierge desk reserve a private table for you tonight?")

        # General queries
        else:
            tool_input = {"hotel_id": hotel_id, "query": user_message}
            tool_calls_trace.append({"tool": "search_activities", "input": tool_input})
            results = search_activities(**tool_input)
            if not results:
                results = search_restaurants(**tool_input)
            recommendation_cards = results[:2]

            reply_lines.append(f"As your concierge at **{hotel_name}**, I am delighted to assist! Here are verified Goa highlights matching your inquiry:")
            for item in results[:2]:
                reply_lines.append(f"\n• **{item['name']}** ({item['area']}): {item.get('description')} ({item.get('distance_from_hotel')})")

        return {
            "reply": "\n".join(reply_lines),
            "tool_calls": tool_calls_trace,
            "cards": recommendation_cards,
            "provider": "AI Concierge Tool-Calling Engine (Active Hotel Grounded)",
            "hotel_origin": f"{hotel_name}, {hotel_area}"
        }

agent_instance = AIConciergeAgent()
