export type SupportedLanguage = 'en' | 'hi' | 'ru' | 'fr' | 'de';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский', flag: '🇷🇺' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', flag: '🇩🇪' },
];

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    itinerary: 'Day-by-Day Plan',
    chat: 'AI Concierge',
    directory: 'Goa Directory',
    bookings: 'My Bookings',
    alerts: 'Coastal Alerts',
    map: 'Interactive Map',
    welcomeToGoa: 'Welcome to Goa',
    conciergeSubtitle: 'Your 24/7 AI Concierge is ready to make your stay unforgettable.',
    autoPlanDay: 'Auto-Plan My Day',
    dinnerPrompt: 'Dinner',
    beachesPrompt: 'Beaches',
    explorePrompt: 'Explore Area',
    hiddenGemsPrompt: 'Hidden Gems',
    downloadICS: 'Download .ICS',
    printPDF: 'Print / PDF',
    copyItinerary: 'Copy Itinerary',
    transitGuide: 'Transit Guide',
    budgetCalculator: 'Trip Budget',
    packingList: 'Smart Packing',
    sunsetCountdown: 'Sunset in',
    goldenHour: 'Golden Hour begins in',
    seaSwimStatus: 'Arabian Sea Swimming',
    safeToSwim: 'Safe to Swim (Green Flag)',
    moderateCaution: 'Moderate Waves (Yellow Flag)',
    installApp: 'Install App',
    offlineMode: 'Offline Mode: Showing cached itinerary',
  },
  hi: {
    itinerary: 'दिन-वार योजना',
    chat: 'एआई दरबान',
    directory: 'गोवा निर्देशिका',
    bookings: 'मेरी बुकिंग्स',
    alerts: 'तटीय चेतावनियां',
    map: 'इंटरएक्टिव नक्शा',
    welcomeToGoa: 'गोवा में आपका स्वागत है',
    conciergeSubtitle: 'आपका 24/7 एआई दरबान आपकी यात्रा को यादगार बनाने के लिए तैयार है।',
    autoPlanDay: 'दिन की योजना बनाएं',
    dinnerPrompt: 'रात का भोजन',
    beachesPrompt: 'समुद्र तट',
    explorePrompt: 'क्षेत्र का भ्रमण',
    hiddenGemsPrompt: 'छिपे हुए स्थान',
    downloadICS: 'कैलेंडर डाउनलोड (.ICS)',
    printPDF: 'प्रिंट / पीडीएफ',
    copyItinerary: 'योजना कॉपी करें',
    transitGuide: 'यातायात गाइड',
    budgetCalculator: 'यात्रा बजट',
    packingList: 'पैकिंग सूची',
    sunsetCountdown: 'सूर्यास्त में शेष',
    goldenHour: 'स्वर्णिम समय शुरू होगा',
    seaSwimStatus: 'अरब सागर में तैराकी',
    safeToSwim: 'तैरने के लिए सुरक्षित (हरा झंडा)',
    moderateCaution: 'सावधानी बरतें (पीला झंडा)',
    installApp: 'ऐप इंस्टॉल करें',
    offlineMode: 'ऑफ़लाइन मोड: सहेजी गई योजना प्रदर्शित',
  },
  ru: {
    itinerary: 'План по дням',
    chat: 'ИИ Консьерж',
    directory: 'Гид по Гоа',
    bookings: 'Мои бронирования',
    alerts: 'Оповещения',
    map: 'Карта Гоа',
    welcomeToGoa: 'Добро пожаловать в Гоа',
    conciergeSubtitle: 'Ваш круглосуточный ИИ-консьерж готов сделать отдых незабываемым.',
    autoPlanDay: 'Спланировать день',
    dinnerPrompt: 'Ужин',
    beachesPrompt: 'Пляжи',
    explorePrompt: 'Исследовать',
    hiddenGemsPrompt: 'Секретные места',
    downloadICS: 'Скачать .ICS',
    printPDF: 'Печать / PDF',
    copyItinerary: 'Скопировать план',
    transitGuide: 'Транспорт',
    budgetCalculator: 'Бюджет поездки',
    packingList: 'Чек-лист вещей',
    sunsetCountdown: 'Закат через',
    goldenHour: 'Золотой час через',
    seaSwimStatus: 'Купание в Аравийском море',
    safeToSwim: 'Безопасно для купания (Зеленый флаг)',
    moderateCaution: 'Умеренные волны (Желтый флаг)',
    installApp: 'Установить приложение',
    offlineMode: 'Офлайн-режим: показан сохраненный маршрут',
  },
  fr: {
    itinerary: 'Itinéraire par jour',
    chat: 'Concierge IA',
    directory: 'Guide de Goa',
    bookings: 'Mes réservations',
    alerts: 'Alertes côtières',
    map: 'Carte interactive',
    welcomeToGoa: 'Bienvenue à Goa',
    conciergeSubtitle: 'Votre concierge IA 24/7 est prêt à rendre votre séjour inoubliable.',
    autoPlanDay: 'Planifier ma journée',
    dinnerPrompt: 'Dîner',
    beachesPrompt: 'Plages',
    explorePrompt: 'Explorer la zone',
    hiddenGemsPrompt: 'Perles cachées',
    downloadICS: 'Télécharger .ICS',
    printPDF: 'Imprimer / PDF',
    copyItinerary: 'Copier l’itinéraire',
    transitGuide: 'Guide transport',
    budgetCalculator: 'Budget voyage',
    packingList: 'Liste de valise',
    sunsetCountdown: 'Coucher de soleil dans',
    goldenHour: 'Heure dorée dans',
    seaSwimStatus: 'Baignade en mer d’Arabie',
    safeToSwim: 'Baignade sécurisée (Drapeau vert)',
    moderateCaution: 'Vagues modérées (Drapeau jaune)',
    installApp: 'Installer l’application',
    offlineMode: 'Mode hors ligne : affichage de l’itinéraire en cache',
  },
  de: {
    itinerary: 'Tagesplan',
    chat: 'KI-Concierge',
    directory: 'Goa Verzeichnis',
    bookings: 'Meine Buchungen',
    alerts: 'Küstenwarnungen',
    map: 'Interaktive Karte',
    welcomeToGoa: 'Willkommen in Goa',
    conciergeSubtitle: 'Ihr 24/7 KI-Concierge ist bereit, Ihren Aufenthalt unvergesslich zu machen.',
    autoPlanDay: 'Tag planen',
    dinnerPrompt: 'Abendessen',
    beachesPrompt: 'Strände',
    explorePrompt: 'Gegend erkunden',
    hiddenGemsPrompt: 'Geheimtipps',
    downloadICS: '.ICS herunterladen',
    printPDF: 'Drucken / PDF',
    copyItinerary: 'Reiseplan kopieren',
    transitGuide: 'Verkehrsratgeber',
    budgetCalculator: 'Reisebudget',
    packingList: 'Packliste',
    sunsetCountdown: 'Sonnenuntergang in',
    goldenHour: 'Goldene Stunde in',
    seaSwimStatus: 'Schwimmen im Arabischen Meer',
    safeToSwim: 'Sicheres Schwimmen (Grüne Flagge)',
    moderateCaution: 'Mäßige Wellen (Gelbe Flagge)',
    installApp: 'App installieren',
    offlineMode: 'Offline-Modus: Gespeicherter Reiseplan aktiv',
  },
};

export function t(key: string, lang: SupportedLanguage = 'en'): string {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
}

export function getLanguageInstruction(lang: SupportedLanguage): string {
  switch (lang) {
    case 'hi':
      return '[Language Instruction: Please respond fluently in Hindi (हिन्दी) with appropriate warmth and hospitality terminology.]';
    case 'ru':
      return '[Language Instruction: Please respond in Russian (Русский), providing helpful and culturally tuned recommendations for Goa.]';
    case 'fr':
      return '[Language Instruction: Please respond in elegant French (Français) suitable for luxury hospitality.]';
    case 'de':
      return '[Language Instruction: Please respond in German (Deutsch) with clear, structured travel tips.]';
    default:
      return '';
  }
}
