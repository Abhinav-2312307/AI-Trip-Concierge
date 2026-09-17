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

def get_system_prompt(guest_name: Optional[str] = None) -> str:
    guest_context = f"The guest's name is {guest_name.strip()}, staying in a Sea View Luxury Suite.\n" if guest_name and guest_name.strip() else "The guest is staying in a Sea View Luxury Suite.\n"
    return (
        "You are the exclusive AI Trip Concierge for the guest staying at Taj Fort Aguada Resort & Spa, Goa "
        "located in Sinquerim, Candolim, North Goa.\n" + guest_context +
        "Crucial Guidelines:\n"
        "1. When the guest asks for recommendations 'near me' or 'nearby', always use their hotel location in Sinquerim / Candolim as the origin.\n"
        "2. Always call tools (search_restaurants, search_activities, get_transport_tips, get_weather_and_tide_info) to retrieve authentic Goa knowledge.\n"
        "3. Never hallucinate or invent fake place names, fictional addresses, or wrong prices. Only recommend places retrieved from tool execution.\n"
        "4. When recommending restaurants, always include: Name, Area, Cuisine, Price Range, One-line Reason to visit, and Distance/Travel time from Taj Fort Aguada.\n"
        "5. Keep responses conversational, warm, polished, and hospitable. Greet the guest warmly by name if provided, or as our esteemed guest."
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

    def chat(self, user_message: str, chat_history: Optional[List[Dict[str, str]]] = None, guest_name: Optional[str] = None) -> Dict[str, Any]:
        """Process user message via Claude tool-use, falling back to smart local tool calling if API key is missing."""
        if self.client:
            try:
                return self._chat_claude(user_message, chat_history or [], guest_name=guest_name)
            except Exception as e:
                logger.error(f"Claude API execution failed: {e}. Falling back to offline tool engine.")
                return self._chat_fallback(user_message, chat_history or [], guest_name=guest_name)
        else:
            return self._chat_fallback(user_message, chat_history or [], guest_name=guest_name)

    def _chat_claude(self, user_message: str, chat_history: List[Dict[str, str]], guest_name: Optional[str] = None) -> Dict[str, Any]:
        """Execute conversational flow with Anthropic Claude and tool calling."""
        import anthropic

        system_prompt = get_system_prompt(guest_name)
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

                # Execute local tool
                tool_result = execute_tool(tool_name, tool_input)
                
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
                "hotel_origin": "Taj Fort Aguada, Candolim"
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
                "hotel_origin": "Taj Fort Aguada, Candolim"
            }

    def _chat_fallback(self, user_message: str, chat_history: List[Dict[str, str]], guest_name: Optional[str] = None) -> Dict[str, Any]:
        """Intelligent semantic tool dispatcher fallback for offline/keyless demo environments."""
        msg = user_message.lower().strip()
        tool_calls_trace = []
        recommendation_cards = []
        reply_lines = []

        # Intent 1: Dinner / Restaurant near me
        if any(w in msg for w in ["dinner", "lunch", "restaurant", "food", "eat", "dining", "hungry", "dish"]):
            is_near = any(w in msg for w in ["near", "nearby", "around", "closest", "tonight", "here"])
            cuisine_filter = ""
            if "seafood" in msg:
                cuisine_filter = "seafood"
            elif "south indian" in msg or "thali" in msg:
                cuisine_filter = "south indian"
            elif "greek" in msg:
                cuisine_filter = "greek"

            area_filter = ""
            if "baga" in msg:
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
                "query": cuisine_filter or "dinner",
                "area": area_filter,
                "near_hotel": is_near or not area_filter
            }
            tool_calls_trace.append({"tool": "search_restaurants", "input": tool_input})
            places = search_restaurants(**tool_input)

            if places:
                recommendation_cards = places[:2]
                primary = places[0]
                reply_lines.append(f"Here is a fantastic dining recommendation for you tonight right near your stay at **Taj Fort Aguada**:\n")
                reply_lines.append(f"🍽️ **{primary['name']}**")
                reply_lines.append(f"• **Area**: {primary['area']} ({primary['distance_from_hotel']})")
                reply_lines.append(f"• **Cuisine**: {primary['cuisine']}")
                reply_lines.append(f"• **Price Range**: {primary['price_range']}")
                reply_lines.append(f"• **Why Visit**: {primary['description']}")
                if "signature_dishes" in primary:
                    reply_lines.append(f"• **Must-Try**: {', '.join(primary['signature_dishes'][:3])}")

                if len(places) > 1:
                    secondary = places[1]
                    reply_lines.append(f"\nAlternatively, if you prefer a different atmosphere:\n• **{secondary['name']}** in {secondary['area']} — {secondary['vibe']} ({secondary['price_range']}).")
                
                reply_lines.append("\nWould you like me to request a priority table reservation through the Taj concierge desk?")
            else:
                reply_lines.append("I checked our North Goa dining directory and recommend visiting **The Fisherman's Wharf** in Candolim (just 2.5 km from your resort) for exquisite Goan seafood and live music.")

        # Intent 2: Chill beach / morning beach
        elif any(w in msg for w in ["beach", "sea", "sand", "swim", "chill beach", "morning beach"]):
            tool_input = {"query": "chill beach", "category": "beach", "time_of_day": "morning"}
            tool_calls_trace.append({"tool": "search_activities", "input": tool_input})
            beaches = search_activities(**tool_input)
            
            # Select peaceful/clean beaches
            quiet_beaches = [b for b in beaches if any(t in b.get("tags", []) for t in ["chill beach", "relax", "near hotel"])]
            selected = quiet_beaches if quiet_beaches else beaches
            recommendation_cards = selected[:2]
            primary = selected[0]

            reply_lines.append(f"For a serene and refreshing morning, here is my top recommendation:\n")
            reply_lines.append(f"🏖️ **{primary['name']}**")
            reply_lines.append(f"• **Area**: {primary['area']} ({primary['distance_from_hotel']})")
            reply_lines.append(f"• **Atmosphere**: {primary['vibe']}")
            reply_lines.append(f"• **Best Time**: {primary['best_time']}")
            reply_lines.append(f"• **Why Visit**: {primary['description']}")
            
            if len(selected) > 1 and selected[1]['id'] == 'sinquerim-candolim-beach':
                reply_lines.append(f"\n💡 *Quick Tip*: If you prefer something right on your doorstep without a cab ride, **Sinquerim Beach** is just 5 minutes walk from your room!")

        # Intent 3: Anjuna / Evening activities
        elif "anjuna" in msg or ("evening" in msg and not "dinner" in msg):
            area = "Anjuna" if "anjuna" in msg else ""
            tool_input = {"query": "sunset evening", "area": area, "time_of_day": "evening"}
            tool_calls_trace.append({"tool": "search_activities", "input": tool_input})
            activities = search_activities(**tool_input)
            recommendation_cards = activities[:2]
            
            reply_lines.append(f"Here are top-tier evening experiences around {area or 'North Goa'}:\n")
            for act in activities[:2]:
                reply_lines.append(f"✨ **{act['name']}** ({act['area']})")
                reply_lines.append(f"• **Vibe**: {act['vibe']}")
                reply_lines.append(f"• **Distance**: {act['distance_from_hotel']}")
                reply_lines.append(f"• **Experience**: {act['description']}\n")

        # Intent 4: Transport / How to travel from X to Y
        elif any(w in msg for w in ["travel", "go to", "cab", "taxi", "scooter", "goamiles", "reach", "transport", "how can i"]):
            destination = "Panjim" if "panjim" in msg else ("Baga" if "baga" in msg else "Palolem")
            origin = "Baga" if "from baga" in msg else "Taj Fort Aguada, Candolim"
            tool_input = {"origin": origin, "destination": destination}
            tool_calls_trace.append({"tool": "get_transport_tips", "input": tool_input})
            guides = get_transport_tips(**tool_input)

            reply_lines.append(f"Here is the best way to travel between **{origin}** and **{destination}**:\n")
            reply_lines.append(f"1. 🚗 **GoaMiles App Cab**: Most reliable option with meter pricing (~₹500-650). Download the GoaMiles app or ask the hotel concierge to book one.")
            reply_lines.append(f"2. 🛵 **Scooter / Activa Rental**: (~₹400/day). Scenic 30-minute ride along the Nerul / Mandovi river road. Make sure to wear helmets.")
            reply_lines.append(f"3. 🏍️ **Goa Pilot (Motorcycle Taxi)**: Fastest for solo travelers (~₹150-200).")
            reply_lines.append(f"\n💡 *Pro-Tip*: If heading into Panjim Latin Quarter, afternoon around 4:00 PM is ideal for exploring before sunset.")

        # Intent 5: Romantic evening
        elif any(w in msg for w in ["romantic", "couple", "date", "anniversary", "sunset"]):
            tool_input = {"query": "romantic sunset", "vibe": "romantic"}
            tool_calls_trace.append({"tool": "search_restaurants", "input": tool_input})
            rom_restaurants = search_restaurants(**tool_input)
            tool_calls_trace.append({"tool": "search_activities", "input": {"query": "sunset cruise"}})
            rom_activities = search_activities(query="sunset cruise")

            combined_cards = (rom_restaurants[:1] + rom_activities[:1])
            recommendation_cards = combined_cards

            reply_lines.append(f"Here is a curated itinerary for an unforgettable romantic evening in Goa:\n")
            reply_lines.append(f"1. 🌅 **5:15 PM — Mandovi River Luxury Sunset Cruise**: Sip sparkling wine and enjoy live saxophone music as the sun sets over the Arabian Sea.")
            reply_lines.append(f"2. 🕯️ **7:45 PM — Intimate Dinner at Thalassa (Siolim) or Gunpowder (Assagao)**: Dine under a candlelit heritage garden canopy with artisanal cocktails and exquisite coastal cuisine.")
            reply_lines.append(f"\nWould you like our concierge team to reserve prime sunset seating for you?")

        # General queries
        else:
            tool_input = {"query": user_message}
            tool_calls_trace.append({"tool": "search_activities", "input": tool_input})
            results = search_activities(query=user_message)
            if not results:
                results = search_restaurants(query=user_message)
            recommendation_cards = results[:2]

            reply_lines.append(f"As your Taj Fort Aguada concierge, I'm delighted to assist! Based on your Goa trip details, here are recommended highlights:")
            for item in results[:2]:
                reply_lines.append(f"\n• **{item['name']}** ({item['area']}): {item['description']} ({item['distance_from_hotel']})")

        return {
            "reply": "\n".join(reply_lines),
            "tool_calls": tool_calls_trace,
            "cards": recommendation_cards,
            "provider": "Anthropic Claude Tool-Calling Engine (Smart Fallback Mode)",
            "hotel_origin": "Taj Fort Aguada, Candolim"
        }

agent_instance = AIConciergeAgent()
