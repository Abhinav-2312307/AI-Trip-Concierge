# 🌴 AI Trip Concierge — Premium Goa Hotel Travel Companion

> **Hackathon Final-Round Demo Prototype**  
> Post-booking travel companion for hotel guests in Goa, India.

---

## 🌟 Problem Statement & Solution

**Problem**: Booking platforms abruptly end their relationship with the guest at checkout — there is no continuity into the actual trip, which is where hotel loyalty and on-ground hospitality experiences thrive.

**Solution**: **AI Trip Concierge** is an intelligent, post-booking companion tailored for hotel guests. It remembers trip context, generates customized multi-day itineraries, recommends verified local dining & cultural spots grounded in a local knowledge base (no hallucinations), provides local transport navigation, and sends proactive contextual alerts (weather, check-in, sunset golden hours).

---

## 🚀 Key Features

1. **Personalized Guest Dashboard**:
   - Dynamic booking overview for hotel guests at **Taj Fort Aguada Resort & Spa, Goa (Sinquerim, Candolim)** (Confirmation: `TAJ-GOA-89421`) with customizable guest name onboarding.
   - Real-time coastal weather conditions (temperature, humidity, high tide timing, sunset countdown).
   - 1-click quick concierge launcher chips.

2. **Smart Day-by-Day Itinerary Engine**:
   - Customizable duration (1 to 5 days, default 3 days) with celebratory confetti.
   - Realistic morning, afternoon, and evening timelines with travel distances calculated from Candolim.
   - Authentic Goan locations (Aguada Fort, Pousada by the Beach, Gunpowder Assagao, Fontainhas Latin Quarter, Basilica of Bom Jesus, Mandovi Sunset Cruise, Thalassa Siolim).

3. **Conversational AI Concierge (Tool-Calling Engine)**:
   - Powered by official **Anthropic Claude Python SDK** (`claude-3-5-sonnet`) with native tool-calling:
     - `search_restaurants`
     - `search_activities`
     - `get_transport_tips`
     - `get_place_details`
     - `get_weather_and_tide_info`
   - Built-in intelligent local semantic tool-calling fallback engine for 100% fail-safe offline and keyless demo presentation.
   - Real-time tool execution badges, rich interactive recommendation cards with signature dishes, price range, and distance indicators.

4. **Proactive Smart Alerts Hub**:
   - Real-time simulation of critical travel alerts:
     - 🌧️ *Evening Rain Advisory (Baga & Calangute after 6 PM)* with indoor dining switch recommendations.
     - 🔑 *Taj Digital Room Key & Welcome Refreshment Pass*.
     - 🌅 *Golden Hour Countdown (Chapora Fort & Thalassa)*.
     - 🌊 *High Tide Advisory (Vagator Rocks)*.
   - Interactive toast notification and auto-injection into the live AI concierge chat feed.

5. **Local Transport & Mobility Guide**:
   - Clear advice on Goa's unique mobility landscape: official **GoaMiles App Cab** meter rates, scooter rentals, motorcycle pilots (bike taxis), and Mandovi river ferries.

---

## 🏗️ Architecture

```
ai-trip-concierge/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI server & endpoints
│   │   ├── agent.py         # Claude 3.5 Sonnet Tool Use & Fallback Agent
│   │   ├── tools.py         # Search & filter tools for knowledge base
│   │   ├── itinerary.py     # Multi-day itinerary generator
│   │   └── alerts.py        # Proactive alerts simulator
│   └── data/
│       └── goa.json         # Curated Goa Knowledge Base (22+ places, transport)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── TripOverview.tsx
│   │   │   ├── ItineraryView.tsx
│   │   │   ├── AIChat.tsx
│   │   │   ├── RecommendationsView.tsx
│   │   │   ├── AlertsHub.tsx
│   │   │   └── TransportModal.tsx
│   │   ├── services/
│   │   │   └── api.ts       # Backend REST API client
│   │   ├── types.ts         # TypeScript definitions
│   │   ├── App.tsx          # Main application shell
│   │   ├── main.tsx
│   │   └── index.css        # Premium Goa aesthetic design tokens
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── demo_script.md           # 2-Minute Live Pitch & Demo Script
├── requirements.txt
├── .env.example
└── README.md
```

---

## 🛠️ Quick Start & Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Navigate to project root
cd AI-Trip-Concierge

# (Optional) Set your Anthropic API Key in .env
copy .env.example .env

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server (Port 8000)
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite development server (Port 5173)
npm run dev
```

Open your browser at `http://127.0.0.1:5173/`.

---

## 🎯 Verification & Demo Testing

1. **Dashboard**: Loads Taj Fort Aguada booking details, guest profile, and live weather.
2. **Itinerary**: Click *"Generate My 3-Day Itinerary"* to see Day 1, 2, and 3 morning/afternoon/evening plans.
3. **AI Chat**: Click *"🍽️ Dinner Near Me Tonight"* or send *"What's a good place for dinner near me tonight?"* to verify tool-calling traces and rich recommendation cards.
4. **Proactive Alert**: Click *"⚡ Simulate Alert"* in the top navbar to trigger the 6 PM Baga rain warning toast and chat alert.
5. **Transport Guide**: Click *"Transport Guide"* in navbar for Goa scooter, GoaMiles, and pilot bike taxi guidance.
