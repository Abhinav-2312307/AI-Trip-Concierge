import type { ItineraryResponse, ItinerarySlot, DayPlan } from '../types';

/**
 * Format a Date object to iCalendar DTSTART / DTEND string: YYYYMMDDTHHMMSS
 */
function formatICSDate(date: Date, hours: number, minutes: number = 0): string {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = '00';
  return `${year}${month}${day}T${h}${m}${s}`;
}

/**
 * Clean text for iCalendar description field
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Parse a base date from date string or fallback to tomorrow
 */
function getBaseDate(dateStr?: string, offsetDays: number = 0): Date {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 1 + offsetDays);
    return fallback;
  }
  d.setDate(d.getDate() + offsetDays);
  return d;
}

/**
 * Generate standard RFC 5545 iCalendar content string
 */
export function generateICSContent(
  itinerary: ItineraryResponse,
  hotelName: string,
  guestName?: string
): string {
  const nowICS = formatICSDate(new Date(), new Date().getHours(), new Date().getMinutes());
  let eventsICS = '';

  const slotTimes = {
    morning: { startH: 9, startM: 0, endH: 12, endM: 30, label: 'Morning' },
    afternoon: { startH: 13, startM: 30, endH: 17, endM: 30, label: 'Afternoon' },
    evening: { startH: 19, startM: 0, endH: 22, endM: 30, label: 'Evening & Dinner' },
  };

  itinerary.itinerary.forEach((day: DayPlan, idx: number) => {
    const dayDate = getBaseDate(day.date || itinerary.start_date, idx);

    const slots: { slot: ItinerarySlot; config: typeof slotTimes.morning }[] = [
      { slot: day.morning, config: slotTimes.morning },
      { slot: day.afternoon, config: slotTimes.afternoon },
      { slot: day.evening, config: slotTimes.evening },
    ];

    slots.forEach(({ slot, config }) => {
      if (!slot) return;
      const start = formatICSDate(dayDate, config.startH, config.startM);
      const end = formatICSDate(dayDate, config.endH, config.endM);
      const placeName = slot.place?.name || slot.activity_title;
      const location = slot.place?.area ? `${placeName}, ${slot.place.area}, Goa` : `${placeName}, Goa`;
      const summary = `[Goa Day ${day.day_number}] ${slot.activity_title} (${config.label})`;

      let description = `${slot.description}\\n\\n`;
      description += `📍 Distance from ${hotelName}: ${slot.distance_from_hotel}\\n`;
      description += `⏱️ Duration: ${slot.duration}\\n`;
      description += `💰 Estimated Budget: ${slot.budget}\\n`;
      if (slot.food_tip) {
        description += `🍽️ Concierge Tip: ${slot.food_tip}\\n`;
      }
      if (guestName) {
        description += `👤 Reserved for: ${guestName}\\n`;
      }
      description += `🏨 Curated by AI Concierge (${hotelName})`;

      const uid = `goa-trip-${day.day_number}-${config.label.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}@aitripconcierge.com`;

      eventsICS += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${nowICS}
DTSTART:${start}
DTEND:${end}
SUMMARY:${escapeICSText(summary)}
LOCATION:${escapeICSText(location)}
DESCRIPTION:${escapeICSText(description)}
STATUS:CONFIRMED
CATEGORIES:Travel,Vacation,Goa Concierge
END:VEVENT
`;
    });
  });

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AI Trip Concierge//Luxury Goa Experience//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Goa Trip Itinerary - ${escapeICSText(hotelName)}
X-WR-TIMEZONE:Asia/Kolkata
${eventsICS}END:VCALENDAR`;
}

/**
 * Trigger immediate browser download of .ics calendar file
 */
export function downloadICSFile(
  itinerary: ItineraryResponse,
  hotelName: string,
  guestName?: string
): void {
  const icsData = generateICSContent(itinerary, hotelName, guestName);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeHotel = hotelName.replace(/[^a-zA-Z0-9]/g, '_').replace(/__+/g, '_');
  link.href = url;
  link.setAttribute('download', `${safeHotel}_Goa_Itinerary.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar Web URL for a specific itinerary day or slot
 */
export function getGoogleCalendarUrl(
  slot: ItinerarySlot,
  dayNumber: number,
  periodName: string,
  dateStr?: string,
  hotelName?: string
): string {
  const d = getBaseDate(dateStr);
  const startHours = periodName.toLowerCase().includes('morning') ? 9 : periodName.toLowerCase().includes('afternoon') ? 14 : 19;
  const start = formatICSDate(d, startHours, 0);
  const end = formatICSDate(d, startHours + 3, 0);

  const title = encodeURIComponent(`[Day ${dayNumber}] ${slot.activity_title} - Goa`);
  const placeName = slot.place?.name || slot.activity_title;
  const location = encodeURIComponent(`${placeName}, ${slot.place?.area || 'Goa'}, India`);
  
  let details = `${slot.description}\n\n`;
  details += `• Distance: ${slot.distance_from_hotel} from ${hotelName || 'hotel'}\n`;
  details += `• Estimated Budget: ${slot.budget}\n`;
  if (slot.food_tip) details += `• Concierge Tip: ${slot.food_tip}\n`;
  details += `\nCurated by AI Trip Concierge`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${location}`;
}

/**
 * Format full itinerary into a clean, WhatsApp & Email friendly markdown text
 */
export function formatItineraryForClipboard(
  itinerary: ItineraryResponse,
  hotelName: string,
  guestName?: string
): string {
  const lines: string[] = [];
  lines.push(`🌴 *GOA LUXURY TRAVEL ITINERARY* 🌴`);
  lines.push(`🏨 Stay: ${hotelName}`);
  if (guestName) lines.push(`👤 Guest: ${guestName}`);
  lines.push(`📅 Duration: ${itinerary.total_days} Days`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  itinerary.itinerary.forEach((day) => {
    lines.push(`\n📍 *DAY ${day.day_number}: ${day.theme.toUpperCase()}*`);
    if (day.full_date_formatted) lines.push(`🗓️ ${day.full_date_formatted}`);
    lines.push(`• *Morning (9:00 AM)*: ${day.morning.activity_title}`);
    lines.push(`  Area: ${day.morning.place?.area || 'Goa'} | Budget: ${day.morning.budget}`);
    if (day.morning.food_tip) lines.push(`  💡 ${day.morning.food_tip}`);

    lines.push(`• *Afternoon (1:30 PM)*: ${day.afternoon.activity_title}`);
    lines.push(`  Area: ${day.afternoon.place?.area || 'Goa'} | Budget: ${day.afternoon.budget}`);
    if (day.afternoon.food_tip) lines.push(`  💡 ${day.afternoon.food_tip}`);

    lines.push(`• *Evening (7:00 PM)*: ${day.evening.activity_title}`);
    lines.push(`  Area: ${day.evening.place?.area || 'Goa'} | Budget: ${day.evening.budget}`);
    if (day.evening.food_tip) lines.push(`  💡 ${day.evening.food_tip}`);
  });

  lines.push(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`✨ Generated by AI Trip Concierge • Have a magnificent holiday in Goa!`);
  return lines.join('\n');
}
