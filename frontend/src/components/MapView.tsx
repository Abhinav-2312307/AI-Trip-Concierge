import React, { useEffect, useRef, useState } from 'react';
import { Navigation, Compass, Sparkles, Utensils, Waves, Landmark, PartyPopper } from 'lucide-react';
import type { HotelBooking, ItineraryResponse } from '../types';
import type { SupportedLanguage } from '../utils/i18n';

declare const L: any;

interface MapViewProps {
  activeHotel: HotelBooking | null;
  itineraryData: ItineraryResponse | null;
  onAskConcierge: (placeName: string) => void;
  theme: 'light' | 'dark';
  lang?: SupportedLanguage;
}

// Curated Top Goa Venues with exact coordinates
interface CuratedVenue {
  id: string;
  name: string;
  category: 'dining' | 'beach' | 'culture' | 'nightlife';
  lat: number;
  lng: number;
  area: string;
  region: string;
  vibe: string;
  price: string;
  image: string;
  description: string;
}

const CURATED_VENUES: CuratedVenue[] = [
  {
    id: 'gunpowder',
    name: 'Gunpowder',
    category: 'dining',
    lat: 15.5905,
    lng: 73.7842,
    area: 'Assagao',
    region: 'North Goa',
    vibe: 'Bohemian Heritage Garden',
    price: '₹₹₹',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    description: 'Sensational coastal South Indian fare served in a dreamy 150-year-old Portuguese mansion courtyard.'
  },
  {
    id: 'thalassa',
    name: 'Thalassa',
    category: 'dining',
    lat: 15.6262,
    lng: 73.7634,
    area: 'Siolim',
    region: 'North Goa',
    vibe: 'Greek Sunset Glamour',
    price: '₹₹₹₹',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    description: 'Iconic cliffside Greek taverna famous for scenic sunset cocktails, fresh seafood, and live performances.'
  },
  {
    id: 'bomras',
    name: "Bomra's",
    category: 'dining',
    lat: 15.5862,
    lng: 73.7441,
    area: 'Anjuna',
    region: 'North Goa',
    vibe: 'Modern Burmese Chic',
    price: '₹₹₹₹',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    description: 'World-renowned Burmese flavors, tea leaf salads, and artisanal cocktails under banyan trees.'
  },
  {
    id: 'fishermans-wharf',
    name: "The Fisherman's Wharf",
    category: 'dining',
    lat: 15.1764,
    lng: 73.9460,
    area: 'Cavelossim',
    region: 'South Goa',
    vibe: 'Riverside Goan Heritage',
    price: '₹₹₹',
    image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80',
    description: 'Waterfront dining along the Sal River with live Goan music and legendary butter garlic crab.'
  },
  {
    id: 'martins-corner',
    name: "Martin's Corner",
    category: 'dining',
    lat: 15.2980,
    lng: 73.9160,
    area: 'Betalbatim',
    region: 'South Goa',
    vibe: 'Celebrity Goan Classic',
    price: '₹₹₹',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    description: 'Famous village restaurant serving authentic prawn balchão and Goan pork sorpotel loved by luminaries.'
  },
  {
    id: 'fontainhas',
    name: 'Fontainhas Latin Quarter',
    category: 'culture',
    lat: 15.4980,
    lng: 73.8320,
    area: 'Panjim',
    region: 'Central Goa',
    vibe: 'Portuguese Heritage',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?auto=format&fit=crop&w=600&q=80',
    description: 'Vibrant cobblestone alleys, 18th-century pastel mansions, traditional art galleries, and bakeries.'
  },
  {
    id: 'bom-jesus',
    name: 'Basilica of Bom Jesus',
    category: 'culture',
    lat: 15.5008,
    lng: 73.9116,
    area: 'Old Goa',
    region: 'Central Goa',
    vibe: 'UNESCO World Heritage',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
    description: 'Baroque Catholic basilica constructed in 1605 holding the sacred relics of St. Francis Xavier.'
  },
  {
    id: 'chapora-fort',
    name: 'Chapora Fort',
    category: 'culture',
    lat: 15.6057,
    lng: 73.7378,
    area: 'Vagator',
    region: 'North Goa',
    vibe: 'Historic Vista Point',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
    description: 'Perched high above Vagator Beach and Chapora river estuary with dramatic sea sunsets.'
  },
  {
    id: 'aguada-fort',
    name: 'Fort Aguada & Lighthouse',
    category: 'culture',
    lat: 15.4925,
    lng: 73.7730,
    area: 'Sinquerim',
    region: 'North Goa',
    vibe: '17th Century Fortress',
    price: '₹50',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
    description: 'Colossal Portuguese ocean fortress with panoramic views over Sinquerim bay and Panjim coastline.'
  },
  {
    id: 'morjim-beach',
    name: 'Morjim Beach (Turtle Beach)',
    category: 'beach',
    lat: 15.6174,
    lng: 73.7350,
    area: 'Morjim',
    region: 'North Goa',
    vibe: 'Serene & Pristine',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    description: 'Quiet golden sands where Olive Ridley turtles nest, framed by palm groves and tasteful beach clubs.'
  },
  {
    id: 'ashwem-beach',
    name: 'Ashwem Beach',
    category: 'beach',
    lat: 15.6560,
    lng: 73.7150,
    area: 'Ashwem',
    region: 'North Goa',
    vibe: 'Luxury Bohemian Beach',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80',
    description: 'Wide, peaceful coastline flanked by upscale seaside boutiques, spa shacks, and sun loungers.'
  },
  {
    id: 'palolem-beach',
    name: 'Palolem Beach',
    category: 'beach',
    lat: 15.0100,
    lng: 74.0232,
    area: 'Canacona',
    region: 'South Goa',
    vibe: 'Crescent Paradise',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    description: 'Famous white-sand crescent with calm waters, colorful eco-huts, kayak rentals, and dolphin spotting.'
  },
  {
    id: 'butterfly-beach',
    name: 'Butterfly Beach',
    category: 'beach',
    lat: 14.9960,
    lng: 74.0400,
    area: 'Palolem',
    region: 'South Goa',
    vibe: 'Secret Cove',
    price: 'Boat Access',
    image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=600&q=80',
    description: 'Secluded hidden cove surrounded by dense jungle, accessible predominantly by boat or wilderness trek.'
  },
  {
    id: 'sinq-nightclub',
    name: 'SinQ Nightclub',
    category: 'nightlife',
    lat: 15.5030,
    lng: 73.7710,
    area: 'Candolim',
    region: 'North Goa',
    vibe: 'Poolside Lounge & Club',
    price: '₹₹₹',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
    description: 'High-energy poolside cabanas, signature mixology, and top DJs spinning deep house.'
  },
  {
    id: 'titos-lane',
    name: "Tito's Lane",
    category: 'nightlife',
    lat: 15.5550,
    lng: 73.7517,
    area: 'Baga',
    region: 'North Goa',
    vibe: 'Electrifying Party Strip',
    price: '₹₹₹',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
    description: 'Goa’s legendary nightlife alley brimming with clubs, neon cocktail bars, and energetic revelry.'
  }
];

// Area to coordinate fallback
const AREA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Candolim': { lat: 15.5180, lng: 73.7660 },
  'Sinquerim': { lat: 15.4952, lng: 73.7667 },
  'Calangute': { lat: 15.5439, lng: 73.7553 },
  'Baga': { lat: 15.5550, lng: 73.7517 },
  'Anjuna': { lat: 15.5780, lng: 73.7420 },
  'Vagator': { lat: 15.6022, lng: 73.7345 },
  'Assagao': { lat: 15.5905, lng: 73.7842 },
  'Siolim': { lat: 15.6262, lng: 73.7634 },
  'Morjim': { lat: 15.6174, lng: 73.7350 },
  'Ashwem': { lat: 15.6560, lng: 73.7150 },
  'Panjim': { lat: 15.4989, lng: 73.8278 },
  'Old Goa': { lat: 15.5008, lng: 73.9116 },
  'Cavelossim': { lat: 15.1764, lng: 73.9460 },
  'Mobor': { lat: 15.1528, lng: 73.9452 },
  'Majorda': { lat: 15.3090, lng: 73.9080 },
  'Betalbatim': { lat: 15.2980, lng: 73.9160 },
  'Colva': { lat: 15.2780, lng: 73.9150 },
  'Benaulim': { lat: 15.2500, lng: 73.9230 },
  'Palolem': { lat: 15.0100, lng: 74.0232 },
  'Canacona': { lat: 15.0100, lng: 74.0232 },
};

function getCategoryColor(cat: string): string {
  switch (cat) {
    case 'dining': return '#E07A5F';
    case 'beach': return '#0284C7';
    case 'culture': return '#D97706';
    case 'nightlife': return '#9333EA';
    default: return '#10B981';
  }
}

export const MapView: React.FC<MapViewProps> = ({
  activeHotel,
  itineraryData,
  onAskConcierge,
  theme,
  lang: _lang = 'en'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);

  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [, setForceUpdate] = useState<number>(0);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if L is available
    if (typeof L === 'undefined') {
      const timer = setTimeout(() => setForceUpdate(n => n + 1), 400);
      return () => clearTimeout(timer);
    }

    if (!mapInstanceRef.current) {
      const defaultCenter = activeHotel?.coordinates 
        ? [activeHotel.coordinates.lat, activeHotel.coordinates.lng] 
        : [15.4952, 73.7667]; // Taj Fort Aguada default

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Keyless high-resolution tiles (Esri ArcGIS World Dark Gray Base & World Street Map)
      const tileUrl = theme === 'dark'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';

      const tileLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      markersLayerRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Don't fully destroy to preserve state on quick tab switch, or destroy cleanly
    };
  }, []);

  // Update Tile Layer on Theme Switch
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const tileUrl = theme === 'dark'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';

    tileLayerRef.current.setUrl(tileUrl);
  }, [theme]);

  // Update Markers & Itinerary Polylines
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !routeLayerRef.current || typeof L === 'undefined') return;

    const markersLayer = markersLayerRef.current;
    const routeLayer = routeLayerRef.current;

    markersLayer.clearLayers();
    routeLayer.clearLayers();

    const hotelCoords = activeHotel?.coordinates || { lat: 15.4952, lng: 73.7667 };

    // 1. Render Hotel Marker
    const hotelHtml = `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
      ">
        <div style="
          position: absolute;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(224, 122, 95, 0.35);
          animation: mapPulse 2s infinite ease-out;
        "></div>
        <div style="
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #E07A5F 0%, #C85A3D 100%);
          border: 3px solid #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0,0,0,0.3);
          color: #FFF;
          font-size: 16px;
        ">
          🏰
        </div>
      </div>
    `;

    const hotelIcon = L.divIcon({
      className: 'custom-hotel-marker',
      html: hotelHtml,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22]
    });

    const hotelPopupHtml = `
      <div style="min-width: 220px; font-family: 'Plus Jakarta Sans', sans-serif; color: #111;">
        <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: #E07A5F; font-weight: 800; margin-bottom: 2px;">
          YOUR CURRENT STAY
        </div>
        <div style="font-size: 0.95rem; font-weight: 700; color: #0B1626; margin-bottom: 4px;">
          ${activeHotel?.name || 'Taj Fort Aguada'}
        </div>
        <div style="font-size: 0.78rem; color: #64748B; margin-bottom: 8px;">
          📍 ${activeHotel?.area || 'Sinquerim'}, ${activeHotel?.region || 'North Goa'}
        </div>
        <div style="font-size: 0.75rem; background: #F1F5F9; padding: 6px 8px; border-radius: 6px; display: flex; justify-content: space-between;">
          <span>Room: <strong>${activeHotel?.room_type || 'Luxury Sea View'}</strong></span>
          <span>Check-in: <strong>${activeHotel?.check_in_time || '14:00'}</strong></span>
        </div>
      </div>
    `;

    L.marker([hotelCoords.lat, hotelCoords.lng], { icon: hotelIcon })
      .bindPopup(hotelPopupHtml)
      .addTo(markersLayer);

    // 2. Render Curated Venues according to category filter
    const venuesToRender = selectedCategory === 'all'
      ? CURATED_VENUES
      : CURATED_VENUES.filter(v => v.category === selectedCategory);

    venuesToRender.forEach(venue => {
      const color = getCategoryColor(venue.category);
      const iconEmoji = venue.category === 'dining' ? '🍽️' : venue.category === 'beach' ? '🏖️' : venue.category === 'culture' ? '🏛️' : '🍸';

      const venueHtml = `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${color};
          border: 2.5px solid #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 10px rgba(0,0,0,0.25);
          color: #FFF;
          font-size: 13px;
          cursor: pointer;
          transition: transform 0.2s ease;
        ">
          ${iconEmoji}
        </div>
      `;

      const venueIcon = L.divIcon({
        className: 'custom-venue-marker',
        html: venueHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      const popupHtml = `
        <div style="min-width: 240px; max-width: 280px; font-family: 'Plus Jakarta Sans', sans-serif; color: #111;">
          <img src="${venue.image}" alt="${venue.name}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: ${color};">
              ${venue.category} • ${venue.price}
            </span>
            <span style="font-size: 0.72rem; color: #64748B;">
              ${venue.area}
            </span>
          </div>
          <div style="font-size: 0.95rem; font-weight: 700; color: #0B1626; margin-bottom: 4px;">
            ${venue.name}
          </div>
          <p style="font-size: 0.78rem; color: #475569; margin: 0 0 10px 0; line-height: 1.4;">
            ${venue.description}
          </p>
          <button 
            id="popup-concierge-btn-${venue.id}"
            style="
              width: 100%;
              background: #0B1626;
              color: #FFFFFF;
              border: none;
              border-radius: 6px;
              padding: 6px 12px;
              font-size: 0.75rem;
              font-weight: 600;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
            "
          >
            Ask Concierge About This Spot →
          </button>
        </div>
      `;

      const marker = L.marker([venue.lat, venue.lng], { icon: venueIcon })
        .bindPopup(popupHtml)
        .addTo(markersLayer);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-concierge-btn-${venue.id}`);
        if (btn) {
          btn.onclick = () => {
            onAskConcierge(venue.name);
          };
        }
      });
    });

    // 3. Render Selected Day Itinerary Route
    if (itineraryData && itineraryData.itinerary && itineraryData.itinerary.length > 0) {
      const dayPlan = itineraryData.itinerary.find(d => d.day_number === selectedDay) || itineraryData.itinerary[0];

      if (dayPlan) {
        const slots = [
          { time: 'Morning', slot: dayPlan.morning, index: 1 },
          { time: 'Afternoon', slot: dayPlan.afternoon, index: 2 },
          { time: 'Evening', slot: dayPlan.evening, index: 3 }
        ];

        const routePoints: [number, number][] = [[hotelCoords.lat, hotelCoords.lng]];
        const boundsPoints: [number, number][] = [[hotelCoords.lat, hotelCoords.lng]];

        slots.forEach(({ time, slot, index }) => {
          if (!slot || !slot.place) return;

          // Resolve place coordinates
          let placeLat = hotelCoords.lat;
          let placeLng = hotelCoords.lng;

          // Check curated first
          const matchedVenue = CURATED_VENUES.find(v => v.name.toLowerCase() === slot.place.name.toLowerCase());
          if (matchedVenue) {
            placeLat = matchedVenue.lat;
            placeLng = matchedVenue.lng;
          } else if (AREA_COORDINATES[slot.place.area]) {
            // Slight offset by index so stops in the same area don't overlap exactly
            const areaLoc = AREA_COORDINATES[slot.place.area];
            placeLat = areaLoc.lat + (index * 0.003);
            placeLng = areaLoc.lng + (index * 0.003);
          } else {
            // Default offset near hotel
            placeLat = hotelCoords.lat + (index * 0.015);
            placeLng = hotelCoords.lng + (index * 0.015);
          }

          routePoints.push([placeLat, placeLng]);
          boundsPoints.push([placeLat, placeLng]);

          // Render Itinerary Stop Marker
          const stopHtml = `
            <div style="
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: #0B1626;
              border: 3px solid #F59E0B;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
              color: #FFFFFF;
              font-weight: 800;
              font-size: 13px;
              font-family: 'Plus Jakarta Sans', sans-serif;
            ">
              ${index}
            </div>
          `;

          const stopIcon = L.divIcon({
            className: 'custom-stop-marker',
            html: stopHtml,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -18]
          });

          const stopPopupHtml = `
            <div style="min-width: 220px; font-family: 'Plus Jakarta Sans', sans-serif; color: #111;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span style="font-size: 0.7rem; font-weight: 800; color: #D97706; text-transform: uppercase;">
                  STOP ${index} • ${time}
                </span>
                <span style="font-size: 0.72rem; color: #64748B;">${slot.duration}</span>
              </div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #0B1626; margin-bottom: 4px;">
                ${slot.place.name}
              </div>
              <div style="font-size: 0.78rem; font-weight: 600; color: #E07A5F; margin-bottom: 4px;">
                ${slot.activity_title}
              </div>
              <p style="font-size: 0.76rem; color: #475569; margin: 0 0 8px 0; line-height: 1.35;">
                ${slot.description}
              </p>
              ${slot.budget ? `<div style="font-size: 0.72rem; color: #10B981; font-weight: 600; margin-bottom: 8px;">💵 Est. Budget: ${slot.budget}</div>` : ''}
              <button 
                id="popup-stop-btn-${index}"
                style="
                  width: 100%;
                  background: #E07A5F;
                  color: #FFFFFF;
                  border: none;
                  border-radius: 6px;
                  padding: 6px 12px;
                  font-size: 0.75rem;
                  font-weight: 600;
                  cursor: pointer;
                "
              >
                Explore with Concierge →
              </button>
            </div>
          `;

          const stopMarker = L.marker([placeLat, placeLng], { icon: stopIcon })
            .bindPopup(stopPopupHtml)
            .addTo(routeLayer);

          stopMarker.on('popupopen', () => {
            const btn = document.getElementById(`popup-stop-btn-${index}`);
            if (btn) {
              btn.onclick = () => onAskConcierge(slot.place.name);
            }
          });
        });

        // Close loop back to hotel for return leg
        routePoints.push([hotelCoords.lat, hotelCoords.lng]);

        // Draw animated/styled polyline connecting the itinerary
        L.polyline(routePoints, {
          color: '#E07A5F',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8',
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(routeLayer);
      }
    }
  }, [activeHotel, itineraryData, selectedDay, selectedCategory, theme]);

  const handleCenterHotel = () => {
    if (!mapInstanceRef.current) return;
    const hotelCoords = activeHotel?.coordinates || { lat: 15.4952, lng: 73.7667 };
    mapInstanceRef.current.flyTo([hotelCoords.lat, hotelCoords.lng], 13, { duration: 1.2 });
  };

  const handleFitRoute = () => {
    if (!mapInstanceRef.current || !itineraryData) return;
    const hotelCoords = activeHotel?.coordinates || { lat: 15.4952, lng: 73.7667 };
    const points: [number, number][] = [[hotelCoords.lat, hotelCoords.lng]];

    const dayPlan = itineraryData.itinerary.find(d => d.day_number === selectedDay);
    if (dayPlan) {
      [dayPlan.morning, dayPlan.afternoon, dayPlan.evening].forEach((slot, idx) => {
        if (!slot?.place) return;
        const matched = CURATED_VENUES.find(v => v.name.toLowerCase() === slot.place.name.toLowerCase());
        if (matched) points.push([matched.lat, matched.lng]);
        else if (AREA_COORDINATES[slot.place.area]) {
          const a = AREA_COORDINATES[slot.place.area];
          points.push([a.lat + (idx * 0.003), a.lng + (idx * 0.003)]);
        }
      });
    }

    if (points.length > 1) {
      mapInstanceRef.current.fitBounds(points, { padding: [50, 50], maxZoom: 14 });
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '75vh',
      minHeight: '560px',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid var(--border-primary)',
      boxShadow: 'var(--shadow-elevated)',
      background: 'var(--bg-card)'
    }}>
      {/* Top Floating Control Bar */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        right: '16px',
        zIndex: 400,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'none'
      }}>
        {/* Left Side: Day Route Selector */}
        <div style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-primary)',
          borderRadius: '8px',
          padding: '4px 6px',
          display: 'flex',
          gap: '4px',
          boxShadow: 'var(--shadow-card)',
          pointerEvents: 'auto'
        }}>
          {itineraryData?.itinerary && itineraryData.itinerary.map(d => (
            <button
              key={d.day_number}
              onClick={() => setSelectedDay(d.day_number)}
              style={{
                background: selectedDay === d.day_number ? 'var(--accent-primary)' : 'transparent',
                color: selectedDay === d.day_number ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: selectedDay === d.day_number ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>Day {d.day_number}</span>
            </button>
          ))}
        </div>

        {/* Center: Category Filters */}
        <div style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-primary)',
          borderRadius: '8px',
          padding: '4px 6px',
          display: 'flex',
          gap: '4px',
          boxShadow: 'var(--shadow-card)',
          pointerEvents: 'auto'
        }}>
          {[
            { id: 'all', label: 'All Highlights', icon: Sparkles },
            { id: 'dining', label: 'Dining', icon: Utensils },
            { id: 'beach', label: 'Beaches', icon: Waves },
            { id: 'culture', label: 'Heritage', icon: Landmark },
            { id: 'nightlife', label: 'Nightlife', icon: PartyPopper },
          ].map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  background: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--border-primary)' : '1px solid transparent',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Icon size={13} color={isSelected ? 'var(--accent-primary)' : '#64748B'} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Map Actions */}
        <div style={{
          display: 'flex',
          gap: '8px',
          pointerEvents: 'auto'
        }}>
          <button
            onClick={handleCenterHotel}
            style={{
              background: 'var(--bg-card)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-primary)',
              borderRadius: '8px',
              padding: '6px 14px',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--shadow-subtle)'
            }}
            title="Center view on your hotel"
          >
            <Compass size={14} color="#E07A5F" />
            <span>My Hotel</span>
          </button>

          <button
            onClick={handleFitRoute}
            style={{
              background: 'var(--bg-card)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-primary)',
              borderRadius: '8px',
              padding: '6px 14px',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--shadow-subtle)'
            }}
            title="Fit view to today's complete route"
          >
            <Navigation size={14} color="#3B82F6" />
            <span>Fit Route</span>
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          zIndex: 10 
        }} 
      />

      {/* Bottom Floating Route Summary Card */}
      {itineraryData?.itinerary && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          zIndex: 400,
          background: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          boxShadow: 'var(--shadow-elevated)',
          maxWidth: '380px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
            flexShrink: 0
          }}>
            <Navigation size={18} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 700 }}>
              Day {selectedDay} Itinerary Route
            </div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {itineraryData.itinerary.find(d => d.day_number === selectedDay)?.title || 'Curated Exploration'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Hotel → Stop 1 (Morning) → Stop 2 (Afternoon) → Stop 3 (Evening)
            </div>
          </div>
        </div>
      )}

      {/* Inline animation keyframes for pulse marker */}
      <style>{`
        @keyframes mapPulse {
          0% {
            transform: scale(0.9);
            opacity: 0.8;
          }
          70% {
            transform: scale(1.6);
            opacity: 0;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
