'use strict';

// ── SVG Glyphs (from design/data.jsx) ─────────────────────
const GLYPHS = {
  koffie:       '<path d="M5 7h10v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M15 10h2a2 2 0 0 1 0 4h-2"/>',
  restaurant:   '<path d="M3 2v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V2M7 11v11M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3m0 0v7"/>',
  bar:          '<path d="M8 22h8M12 11v11M17 3H7l1 5a4 4 0 0 0 8 0z"/>',
  museum:       '<line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
  park:         '<polygon points="12 3 5 17 19 17"/><rect x="10" y="17" width="4" height="4"/>',
  wandelen:     '<path d="M3 20l6-12 5 7 3-4 4 9"/>',
  supermarkt:   '<circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/><polyline points="3 4 6 4 8 16 19 16 20 8 7 8"/>',
  bibliotheek:  '<rect x="5" y="3" width="14" height="18"/><line x1="9" y1="3" x2="9" y2="21"/>',
  bioscoop:     '<rect x="3" y="3" width="18" height="18"/><line x1="3" y1="8" x2="8" y2="8"/><line x1="3" y1="16" x2="8" y2="16"/><line x1="16" y1="8" x2="21" y2="8"/><line x1="16" y1="16" x2="21" y2="16"/>',
  bakkerij:     '<path d="M3 14a9 5 0 0 1 18 0v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><line x1="9" y1="11" x2="8" y2="14"/><line x1="13" y1="11" x2="12" y2="14"/><line x1="17" y1="11" x2="16" y2="14"/>',
  fastfood:     '<path d="M5 8a7 3 0 0 1 14 0v1H5zM5 18a7 3 0 0 0 14 0v-1H5z"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="15" x2="21" y2="15"/>',
  speeltuin:    '<polygon points="12 3 14 10 21 12 14 14 12 21 10 14 3 12 10 10"/>',
  camping:      '<polygon points="12 3 3 21 21 21"/><line x1="12" y1="3" x2="12" y2="21"/><polyline points="9 21 12 17 15 21"/>',
  hotel:        '<path d="M2 4v16M22 8v12M2 17h20"/><path d="M2 8h16a4 4 0 0 1 4 4"/><circle cx="7" cy="10" r="1.5"/>',
  vakantiehuis: '<polygon points="3 11 12 3 21 11"/><polyline points="5 9 5 21 19 21 19 9"/>',
  favoriet:     '<polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9"/>',
};

// Maps CATEGORY_MAP keys → GLYPHS keys
const CAT_GLYPH = {
  cafe: 'koffie', restaurant: 'restaurant', bar: 'bar', museum: 'museum',
  park: 'park', hiking: 'wandelen', supermarket: 'supermarkt',
  library: 'bibliotheek', cinema: 'bioscoop', bakery: 'bakkerij',
  fast_food: 'fastfood', playground: 'speeltuin',
};
const ACC_GLYPH = { camping: 'camping', hotel: 'hotel', vakantiewoning: 'vakantiehuis' };

// ── Starting points (from design/data.jsx) ─────────────────
const STARTING_POINTS = [
  { id: 'sp1', track: 'day-out', label: 'Restaurant met terras', sub: 'binnen 20 min fietsen',
    apply: { transport: 'bike', timeMin: 0, timeMax: 20, categories: ['restaurant'] } },
  { id: 'sp2', track: 'day-out', label: 'Museum met café',       sub: 'binnen 30 min auto',
    apply: { transport: 'car',  timeMin: 0, timeMax: 30, categories: ['cafe', 'museum'] } },
  { id: 'sp3', track: 'day-out', label: 'Speeltuin in de buurt', sub: 'binnen lopen',
    apply: { transport: 'walk', timeMin: 0, timeMax: 15, categories: ['playground'] } },
  { id: 'sp4', track: 'stays',   label: 'Camping met zwembad',   sub: 'binnen 90 min auto',
    apply: { transport: 'car',  timeMin: 0, timeMax: 90,  stayType: 'camping', amenities: ['pool'] } },
  { id: 'sp5', track: 'stays',   label: 'B&B met huisdieren',    sub: 'binnen 60 min',
    apply: { transport: 'car',  timeMin: 0, timeMax: 60,  stayType: 'hotel', amenities: ['dogs'] } },
  { id: 'sp6', track: 'stays',   label: 'Vakantiehuis · 6 pers.', sub: 'binnen 2 uur',
    apply: { transport: 'car',  timeMin: 0, timeMax: 120, stayType: 'vakantiewoning', persons: 6 } },
];

// ── External APIs ──────────────────────────────────────────
const VALHALLA = 'https://valhalla1.openstreetmap.de/isochrone';
const OVERPASS = 'https://overpass-api.de/api/interpreter';
const COSTING  = { driving: 'auto', cycling: 'bicycle', walking: 'pedestrian' };
const SPEEDS   = { driving: 40, cycling: 15, walking: 5 };

// ── i18n ───────────────────────────────────────────────────
const TRANSLATIONS = {
  nl: {
    title: 'Bereik — locatieplanner',
    subtitle: 'Ontdek wat er in de buurt is',
    modeDayOut: 'Vandaag uit',
    modeStays: 'Overnachten',
    activity: 'Vandaag uit',
    overnight: 'Overnachten',
    myLocation: 'Mijn locatie',
    locationPh: 'Typ een adres of stad…',
    howFar: 'Hoe ver wil je gaan?',
    transport: 'Vervoersmiddel',
    car: 'Auto', bike: 'Fiets', walk: 'Lopen',
    whatSearch: 'Wat zoek je?',
    multiplePossible: 'meerdere mogelijk',
    accType: 'Type verblijf',
    minStars: 'Minimaal sterren',
    minPersons: 'Minimaal personen',
    amenities: 'Voorzieningen',
    allOption: 'Alle',
    openNow: 'Nu geopend',
    sortBy: 'Sorteren',
    sortDist: 'Afstand',
    sortTime: 'Reistijd',
    sortRating: 'Beoordeling',
    sortName: 'Naam',
    sortStars: '⭐ Sterren',
    viewMap: 'Kaart',
    viewList: 'Lijst',
    favorites: 'Favorieten',
    shareLink: 'Deel',
    surpriseMe: 'Verras me',
    legendOuter: 'Max bereikbaar',
    legendInner: 'Min. afstand',
    startingPoints: 'Veelgebruikte zoekopdrachten',
    resultsLabel: 'plekken binnen bereik',
    search: 'Zoeken',
    searching: 'Bezig…',
    noResults: 'Niets binnen bereik.',
    noResultsSub: 'Probeer een ruimere reistijd, een ander vervoersmiddel, of laat de filters wat los.',
    moreResults: '+ {n} meer — verklein de reistijd voor betere resultaten',
    gpsFound: 'GPS-locatie gevonden!',
    gpsUnavail: 'GPS niet beschikbaar.',
    gpsFailed: 'GPS mislukt. Typ een adres in.',
    enterLocation: 'Voer een locatie in of gebruik GPS.',
    searching2: 'Locatie zoeken…',
    locationNotFound: 'Locatie niet gevonden.',
    lookupFailed: 'Kon de locatie niet opzoeken.',
    searchFailed: 'Zoeken mislukt. Probeer het opnieuw.',
    noSurprise: 'Geen resultaten om van te verrassen!',
    linkCopied: 'Link gekopieerd!',
    linkFailed: 'Kon link niet kopiëren.',
    favAdded: 'Opgeslagen',
    favRemoved: 'Verwijderd',
    from: 'Van', to: 'tot', min: 'min', hour: 'uur',
    roadNetwork: 'wegennetwerk',
    approxCircle: 'geschatte cirkel',
    fromLocation: 'van jouw locatie',
    capacity: 'Capaciteit', persons: 'personen',
    rating: 'Beoordeling', stars: 'sterren',
    openStatus: 'Open', closedStatus: 'Gesloten', unknownHours: 'Tijden onbekend',
    searchBookNearby: 'Zoek & boek in de buurt',
    viewOnOSM: 'Bekijk op OpenStreetMap ↗',
    locations: 'plek', locationsPlural: 'plekken',
    nightLabel: '/ nacht',
    bewaren: 'Bewaren', route: 'Route', booking: 'Booking',
    'cat.cafe': 'Koffie', 'cat.restaurant': 'Restaurant', 'cat.bar': 'Bar',
    'cat.museum': 'Museum', 'cat.park': 'Park', 'cat.hiking': 'Wandelen',
    'cat.supermarket': 'Supermarkt', 'cat.library': 'Bibliotheek',
    'cat.cinema': 'Bioscoop', 'cat.bakery': 'Bakkerij',
    'cat.fast_food': 'Fastfood', 'cat.playground': 'Speeltuin',
    'acc.camping': 'Camping', 'acc.hotel': 'Hotel / B&B', 'acc.house': 'Vakantiehuis',
    catLabels: {
      cafe: 'Koffie', restaurant: 'Restaurant', bar: 'Bar', museum: 'Museum',
      park: 'Park', hiking: 'Wandelen', supermarket: 'Supermarkt',
      library: 'Bibliotheek', cinema: 'Bioscoop', bakery: 'Bakkerij',
      fast_food: 'Fastfood', playground: 'Speeltuin',
    },
    accLabels: { camping: 'Camping', hotel: 'Hotel / B&B', vakantiewoning: 'Vakantiehuis' },
    filterLabels: {
      tents: '⛺ Tent', camper: '🚐 Camper', caravan: '🚗 Caravan',
      electric: '🔌 Elektra', dogs: '🐕 Honden', pool: '🏊 Zwembad',
      wifi: '📶 WiFi', shower: '🚿 Douches', shop: '🛒 Winkel', bbq: '🔥 BBQ',
      parking: '🅿️ Parkeren', restaurant: '🍽️ Restaurant', bar: '🍺 Bar',
      spa: '💆 Spa', garden: '🌿 Tuin',
    },
    amenityLabels: {
      Tent: 'Tent', Camper: 'Camper', Caravan: 'Caravan', Elektra: 'Elektra',
      Honden: 'Honden', Zwembad: 'Zwembad', WiFi: 'WiFi', Douches: 'Douches',
      BBQ: 'BBQ', Parkeren: 'Parkeren', Restaurant: 'Restaurant', Bar: 'Bar',
      Spa: 'Spa', Tuin: 'Tuin',
    },
    transportLabel: { driving: 'auto', cycling: 'fiets', walking: 'lopen' },
  },
  en: {
    title: 'Bereik — location planner',
    subtitle: 'Discover what\'s nearby',
    modeDayOut: 'Day out',
    modeStays: 'Stays',
    activity: 'Day out',
    overnight: 'Stays',
    myLocation: 'My location',
    locationPh: 'Type an address or city…',
    howFar: 'How far do you want to go?',
    transport: 'Transport',
    car: 'Car', bike: 'Bike', walk: 'Walk',
    whatSearch: 'What are you looking for?',
    multiplePossible: 'multiple possible',
    accType: 'Accommodation type',
    minStars: 'Minimum stars',
    minPersons: 'Minimum persons',
    amenities: 'Amenities',
    allOption: 'All',
    openNow: 'Open now',
    sortBy: 'Sort',
    sortDist: 'Distance',
    sortTime: 'Travel time',
    sortRating: 'Rating',
    sortName: 'Name',
    sortStars: '⭐ Stars',
    viewMap: 'Map',
    viewList: 'List',
    favorites: 'Favorites',
    shareLink: 'Share',
    surpriseMe: 'Surprise me',
    legendOuter: 'Max reachable',
    legendInner: 'Min. distance',
    startingPoints: 'Common searches',
    resultsLabel: 'places within reach',
    search: 'Search',
    searching: 'Searching…',
    noResults: 'Nothing within reach.',
    noResultsSub: 'Try a wider travel time, different transport, or ease the filters.',
    moreResults: '+ {n} more — reduce travel time for better results',
    gpsFound: 'GPS location found!',
    gpsUnavail: 'GPS not available.',
    gpsFailed: 'GPS failed. Type an address instead.',
    enterLocation: 'Enter a location or use GPS.',
    searching2: 'Searching location…',
    locationNotFound: 'Location not found.',
    lookupFailed: 'Could not look up location.',
    searchFailed: 'Search failed. Please try again.',
    noSurprise: 'No results to surprise with!',
    linkCopied: 'Link copied!',
    linkFailed: 'Could not copy link.',
    favAdded: 'Saved',
    favRemoved: 'Removed',
    from: 'From', to: 'to', min: 'min', hour: 'hour',
    roadNetwork: 'road network',
    approxCircle: 'estimated circle',
    fromLocation: 'from your location',
    capacity: 'Capacity', persons: 'persons',
    rating: 'Rating', stars: 'stars',
    openStatus: 'Open', closedStatus: 'Closed', unknownHours: 'Hours unknown',
    searchBookNearby: 'Search & book nearby',
    viewOnOSM: 'View on OpenStreetMap ↗',
    locations: 'place', locationsPlural: 'places',
    nightLabel: '/ night',
    bewaren: 'Save', route: 'Route', booking: 'Booking',
    'cat.cafe': 'Coffee', 'cat.restaurant': 'Restaurant', 'cat.bar': 'Bar',
    'cat.museum': 'Museum', 'cat.park': 'Park', 'cat.hiking': 'Hiking',
    'cat.supermarket': 'Supermarket', 'cat.library': 'Library',
    'cat.cinema': 'Cinema', 'cat.bakery': 'Bakery',
    'cat.fast_food': 'Fast food', 'cat.playground': 'Playground',
    'acc.camping': 'Camping', 'acc.hotel': 'Hotel / B&B', 'acc.house': 'Holiday home',
    catLabels: {
      cafe: 'Coffee', restaurant: 'Restaurant', bar: 'Bar', museum: 'Museum',
      park: 'Park', hiking: 'Hiking', supermarket: 'Supermarket',
      library: 'Library', cinema: 'Cinema', bakery: 'Bakery',
      fast_food: 'Fast food', playground: 'Playground',
    },
    accLabels: { camping: 'Camping', hotel: 'Hotel / B&B', vakantiewoning: 'Holiday home' },
    filterLabels: {
      tents: '⛺ Tents', camper: '🚐 Camper', caravan: '🚗 Caravan',
      electric: '🔌 Electric', dogs: '🐕 Dogs', pool: '🏊 Pool',
      wifi: '📶 WiFi', shower: '🚿 Showers', shop: '🛒 Shop', bbq: '🔥 BBQ',
      parking: '🅿️ Parking', restaurant: '🍽️ Restaurant', bar: '🍺 Bar',
      spa: '💆 Spa', garden: '🌿 Garden',
    },
    amenityLabels: {
      Tent: 'Tent', Camper: 'Camper', Caravan: 'Caravan', Elektra: 'Electric',
      Honden: 'Dogs', Zwembad: 'Pool', WiFi: 'WiFi', Douches: 'Showers',
      BBQ: 'BBQ', Parkeren: 'Parking', Restaurant: 'Restaurant', Bar: 'Bar',
      Spa: 'Spa', Tuin: 'Garden',
    },
    transportLabel: { driving: 'car', cycling: 'bike', walking: 'walking' },
  },
};

let lang = 'nl';
function t(key) { return TRANSLATIONS[lang][key] ?? TRANSLATIONS.nl[key] ?? key; }

// ── Category map ───────────────────────────────────────────
const CATEGORY_MAP = {
  cafe:        { icon: '☕', color: '#d97706', queries: ['node[amenity=cafe]',        'way[amenity=cafe]'] },
  restaurant:  { icon: '🍽️', color: '#dc2626', queries: ['node[amenity=restaurant]',  'way[amenity=restaurant]'] },
  bar:         { icon: '🍺', color: '#7c3aed', queries: ['node[amenity=bar]',         'way[amenity=bar]'] },
  museum:      { icon: '🏛️', color: '#0891b2', queries: ['node[tourism=museum]',      'way[tourism=museum]'] },
  park:        { icon: '🌳', color: '#16a34a', queries: ['node[leisure=park]',        'way[leisure=park]'] },
  hiking:      { icon: '🥾', color: '#65a30d', queries: ['relation[route=hiking]',   'node[leisure=nature_reserve]', 'way[leisure=nature_reserve]'] },
  supermarket: { icon: '🛒', color: '#ea580c', queries: ['node[shop=supermarket]',   'way[shop=supermarket]'] },
  library:     { icon: '📚', color: '#4f46e5', queries: ['node[amenity=library]',    'way[amenity=library]'] },
  cinema:      { icon: '🎬', color: '#db2777', queries: ['node[amenity=cinema]',     'way[amenity=cinema]'] },
  bakery:      { icon: '🥐', color: '#b45309', queries: ['node[shop=bakery]',        'way[shop=bakery]'] },
  fast_food:   { icon: '🍔', color: '#e11d48', queries: ['node[amenity=fast_food]',  'way[amenity=fast_food]'] },
  playground:  { icon: '🛝', color: '#059669', queries: ['node[leisure=playground]', 'way[leisure=playground]'] },
};

// ── Accommodation map ──────────────────────────────────────
const ACC_TYPE_MAP = {
  camping: {
    icon: '⛺', color: '#16a34a',
    osmQueries: ['node[tourism=camp_site]', 'way[tourism=camp_site]'],
    filters: [
      { id: 'tents',    checkFn: t => t.tents === 'yes' },
      { id: 'camper',   checkFn: t => t.motorhome === 'yes' },
      { id: 'caravan',  checkFn: t => t.caravans === 'yes' },
      { id: 'electric', checkFn: t => t.electric_hook_up === 'yes' || t.electricity === 'yes' },
      { id: 'dogs',     checkFn: t => t.dogs === 'yes' },
      { id: 'pool',     checkFn: t => t.swimming_pool === 'yes' },
      { id: 'wifi',     checkFn: t => ['wlan','yes'].includes(t.internet_access) },
      { id: 'shower',   checkFn: t => t.shower === 'yes' },
      { id: 'shop',     checkFn: t => t.shop === 'yes' || t.supermarket === 'yes' },
      { id: 'bbq',      checkFn: t => t.bbq === 'yes' },
    ],
    amenityIcons: [
      { icon: '⛺', checkFn: t => t.tents === 'yes',       labelKey: 'Tent' },
      { icon: '🚐', checkFn: t => t.motorhome === 'yes',   labelKey: 'Camper' },
      { icon: '🚗', checkFn: t => t.caravans === 'yes',    labelKey: 'Caravan' },
      { icon: '🔌', checkFn: t => t.electric_hook_up === 'yes' || t.electricity === 'yes', labelKey: 'Elektra' },
      { icon: '🐕', checkFn: t => t.dogs === 'yes',        labelKey: 'Honden' },
      { icon: '🏊', checkFn: t => t.swimming_pool === 'yes', labelKey: 'Zwembad' },
      { icon: '📶', checkFn: t => ['wlan','yes'].includes(t.internet_access), labelKey: 'WiFi' },
      { icon: '🚿', checkFn: t => t.shower === 'yes',      labelKey: 'Douches' },
      { icon: '🔥', checkFn: t => t.bbq === 'yes',         labelKey: 'BBQ' },
    ],
  },
  hotel: {
    icon: '🏨', color: '#2563eb',
    osmQueries: [
      'node[tourism=hotel]',  'way[tourism=hotel]',
      'node[tourism=hostel]', 'way[tourism=hostel]',
      'node[tourism=guest_house]', 'way[tourism=guest_house]',
      'node[tourism=motel]',  'way[tourism=motel]',
    ],
    hasStars: true,
    filters: [
      { id: 'dogs',       checkFn: t => t.dogs === 'yes' },
      { id: 'pool',       checkFn: t => t.swimming_pool === 'yes' },
      { id: 'parking',    checkFn: t => ['yes','public','private','free'].includes(t.parking) },
      { id: 'wifi',       checkFn: t => ['wlan','yes'].includes(t.internet_access) },
      { id: 'restaurant', checkFn: t => t.restaurant === 'yes' },
      { id: 'bar',        checkFn: t => t.bar === 'yes' },
      { id: 'spa',        checkFn: t => t.spa === 'yes' || t.sauna === 'yes' },
    ],
    amenityIcons: [
      { icon: '🐕', checkFn: t => t.dogs === 'yes',        labelKey: 'Honden' },
      { icon: '🏊', checkFn: t => t.swimming_pool === 'yes', labelKey: 'Zwembad' },
      { icon: '🅿️', checkFn: t => ['yes','public','private','free'].includes(t.parking), labelKey: 'Parkeren' },
      { icon: '📶', checkFn: t => ['wlan','yes'].includes(t.internet_access), labelKey: 'WiFi' },
      { icon: '🍽️', checkFn: t => t.restaurant === 'yes', labelKey: 'Restaurant' },
      { icon: '🍺', checkFn: t => t.bar === 'yes',         labelKey: 'Bar' },
      { icon: '💆', checkFn: t => t.spa === 'yes' || t.sauna === 'yes', labelKey: 'Spa' },
    ],
  },
  vakantiewoning: {
    icon: '🏠', color: '#7c3aed',
    osmQueries: [
      'node[tourism=apartment]',       'way[tourism=apartment]',
      'node[tourism=chalet]',          'way[tourism=chalet]',
      'node[tourism=holiday_village]', 'way[tourism=holiday_village]',
      'node[tourism=alpine_hut]',      'way[tourism=alpine_hut]',
    ],
    hasPersons: true,
    filters: [
      { id: 'dogs',   checkFn: t => t.dogs === 'yes' },
      { id: 'pool',   checkFn: t => t.swimming_pool === 'yes' },
      { id: 'garden', checkFn: t => t.garden === 'yes' },
      { id: 'wifi',   checkFn: t => ['wlan','yes'].includes(t.internet_access) },
      { id: 'bbq',    checkFn: t => t.bbq === 'yes' },
    ],
    amenityIcons: [
      { icon: '🐕', checkFn: t => t.dogs === 'yes',        labelKey: 'Honden' },
      { icon: '🏊', checkFn: t => t.swimming_pool === 'yes', labelKey: 'Zwembad' },
      { icon: '🌿', checkFn: t => t.garden === 'yes',       labelKey: 'Tuin' },
      { icon: '📶', checkFn: t => ['wlan','yes'].includes(t.internet_access), labelKey: 'WiFi' },
      { icon: '🔥', checkFn: t => t.bbq === 'yes',          labelKey: 'BBQ' },
    ],
  },
};

// ── State ──────────────────────────────────────────────────
let map, isoLayer, markersLayer, tileBase, tileLabels;
let userLocation      = null;
let currentMode       = 'activity';
let selectedCats      = new Set(['cafe']);
let visibleCats       = new Set();
let selectedAccType   = 'camping';
let activeAccFilters  = new Set();
let minStars          = 0;
let minPersons        = 0;
let selectedTransport = 'driving';
let allResults        = [];
let openNow           = false;
let currentSort       = 'distance';
let acTimer           = null;
let favorites         = loadFavorites();
let showFavOnly       = false;
let lastInnerRing     = null;
let selectedItemId    = null;

// ── SVG glyph helper ──────────────────────────────────────
function svgGlyph(name, size = 16) {
  if (!GLYPHS[name]) return '';
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="${size}" height="${size}">${GLYPHS[name]}</svg>`;
}

function injectGlyphs() {
  document.querySelectorAll('.chip-glyph[data-glyph]').forEach(el => {
    el.innerHTML = svgGlyph(el.dataset.glyph, 12);
  });
}

// ── Map init ──────────────────────────────────────────────
function initMap() {
  map = L.map('map').setView([52.3, 5.3], 8);
  tileBase = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    maxZoom: 19, subdomains: 'abcd',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · CARTO',
  }).addTo(map);
  tileLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
    maxZoom: 19, subdomains: 'abcd', opacity: 0.7,
  }).addTo(map);
  isoLayer     = L.layerGroup().addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

function updateMapTheme() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (!tileBase || !tileLabels) return;
  tileBase.setUrl(`https://{s}.basemaps.cartocdn.com/${dark ? 'dark_nolabels' : 'light_nolabels'}/{z}/{x}/{y}{r}.png`);
  tileLabels.setUrl(`https://{s}.basemaps.cartocdn.com/${dark ? 'dark_only_labels' : 'light_only_labels'}/{z}/{x}/{y}{r}.png`);
}

// ── i18n apply ─────────────────────────────────────────────
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const txt = t(key);
    if (txt && txt !== key) el.textContent = txt;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const txt = t(el.dataset.i18nPh);
    if (txt) el.placeholder = txt;
  });
  document.title = t('title');
  updateRangeDisplay();
  renderStartingPoints(currentMode);
  if (allResults.length) renderList();
}

// ── Dark mode ──────────────────────────────────────────────
function initDarkMode() {
  const saved = localStorage.getItem('lz_theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  updateMapTheme();
  document.getElementById('dark-toggle').addEventListener('click', () => {
    const cur  = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('lz_theme', next);
    updateMapTheme();
  });
}

// ── Range slider ───────────────────────────────────────────
function initRangeSlider() {
  const minEl = document.getElementById('time-min');
  const maxEl = document.getElementById('time-max');
  const update = () => {
    let minV = parseInt(minEl.value);
    let maxV = parseInt(maxEl.value);
    const step = parseInt(minEl.step) || 5;
    if (minV >= maxV) {
      minEl.value = Math.max(parseInt(minEl.min), maxV - step);
    }
    updateRangeDisplay();
    updateRangeFill();
    renderDonutPreview();
  };
  minEl.addEventListener('input', update);
  maxEl.addEventListener('input', update);
  update();
}

function updateRangeDisplay() {
  const minEl = document.getElementById('time-min');
  const maxEl = document.getElementById('time-max');
  if (!minEl || !maxEl) return;
  const minV = parseInt(minEl.value);
  const maxV = parseInt(maxEl.value);
  const txLabel = (t('transportLabel') || {})[selectedTransport] || selectedTransport;
  const disp = document.getElementById('range-display');
  if (disp) {
    disp.innerHTML = `<b>${formatTravelTime(minV)}</b> ${t('to')} <b>${formatTravelTime(maxV)}</b> · met de ${txLabel}`;
  }
}

function updateRangeFill() {
  const minEl = document.getElementById('time-min');
  const maxEl = document.getElementById('time-max');
  const fill  = document.getElementById('range-fill');
  if (!fill || !minEl || !maxEl) return;
  const minV  = parseInt(minEl.value);
  const maxV  = parseInt(maxEl.value);
  const minPx = parseInt(minEl.min) || 0;
  const maxPx = parseInt(maxEl.max) || 120;
  const leftPct  = ((minV - minPx) / (maxPx - minPx)) * 100;
  const rightPct = ((maxV - minPx) / (maxPx - minPx)) * 100;
  fill.style.left  = `${leftPct}%`;
  fill.style.width = `${rightPct - leftPct}%`;
}

function renderDonutPreview() {
  const minEl   = document.getElementById('time-min');
  const maxEl   = document.getElementById('time-max');
  const preview = document.getElementById('tc-preview');
  if (!preview || !minEl || !maxEl) return;
  const minV  = parseInt(minEl.value, 10);
  const maxV  = parseInt(maxEl.value, 10);
  const ratio = maxV > 0 ? Math.min(0.85, minV / maxV) : 0;
  const innerR = 30 + ratio * 40;
  preview.innerHTML = `
    <svg viewBox="0 0 200 200" fill="none">
      <path d="M100,18 Q160,28 178,80 Q190,140 140,176 Q80,196 36,160 Q12,118 24,68 Q42,28 100,18 Z"
        fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5"/>
      ${ratio > 0 ? `<circle cx="100" cy="100" r="${innerR.toFixed(1)}"
        fill="var(--paper-2)" stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="3 3"/>` : ''}
      <circle cx="100" cy="100" r="3" fill="var(--ink)"/>
    </svg>`;
}

function getEffectiveMin() {
  const minV = parseInt(document.getElementById('time-min').value);
  const maxV = parseInt(document.getElementById('time-max').value);
  const atBottom = minV <= parseInt(document.getElementById('time-min').min);
  if (atBottom && currentMode === 'overnight') return Math.max(0, maxV - 60);
  return atBottom ? 0 : minV;
}

function getEffectiveMax() {
  return parseInt(document.getElementById('time-max').value);
}

// ── Starting points ────────────────────────────────────────
function renderStartingPoints(mode) {
  const track = mode === 'overnight' ? 'stays' : 'day-out';
  const items = STARTING_POINTS.filter(s => s.track === track);
  const root  = document.getElementById('starting-points');
  if (!root) return;

  let html = `<div class="sp-head"><span class="sp-label">${escHtml(t('startingPoints'))}</span></div>`;
  html += items.map(s => `
    <button class="sp-row" data-preset="${s.id}">
      <span class="sp-text">
        <span class="sp-title">${escHtml(s.label)}</span>
        <span class="sp-sub">— ${escHtml(s.sub)}</span>
      </span>
      <span class="sp-cta">→</span>
    </button>`).join('');
  root.innerHTML = html;

  root.querySelectorAll('.sp-row').forEach(row => {
    row.addEventListener('click', () => {
      const sp = STARTING_POINTS.find(s => s.id === row.dataset.preset);
      if (sp) applyPreset(sp.apply);
      document.getElementById('search-btn').click();
    });
  });
}

function applyPreset(a) {
  const transportMap = { car: 'driving', bike: 'cycling', walk: 'walking' };
  if (a.transport) {
    selectedTransport = transportMap[a.transport] || a.transport;
    document.querySelectorAll('.transport-btn').forEach(b => {
      const on = b.dataset.mode === selectedTransport;
      b.classList.toggle('active', on);
      b.classList.toggle('on', on);
    });
    updateRangeDisplay();
  }
  const minEl = document.getElementById('time-min');
  const maxEl = document.getElementById('time-max');
  if (a.timeMin !== undefined) minEl.value = a.timeMin;
  if (a.timeMax !== undefined) maxEl.value = a.timeMax;
  updateRangeDisplay(); updateRangeFill(); renderDonutPreview();

  if (a.categories) {
    selectedCats = new Set(a.categories.filter(c => CATEGORY_MAP[c]));
    syncCatButtons();
  }
  if (a.stayType && ACC_TYPE_MAP[a.stayType]) {
    selectedAccType = a.stayType;
    document.querySelectorAll('.acc-type-btn').forEach(b => {
      const on = b.dataset.type === selectedAccType;
      b.classList.toggle('active', on); b.classList.toggle('on', on);
    });
    activeAccFilters.clear();
    if (a.amenities) a.amenities.forEach(id => activeAccFilters.add(id));
    renderAccFilters();
  }
  if (a.persons !== undefined) {
    minPersons = a.persons;
    document.querySelectorAll('#persons-btns .filter-opt-btn').forEach(b => {
      const on = parseInt(b.dataset.value) === a.persons;
      b.classList.toggle('active', on); b.classList.toggle('on', on);
    });
  }
}

// ── Screen state ───────────────────────────────────────────
function setScreen(screen) {
  const app = document.getElementById('app');
  app.dataset.screen = screen;
  const isResults = screen === 'results';

  document.getElementById('view-toggle').classList.toggle('hidden', !isResults);
  document.getElementById('back-btn').classList.toggle('hidden', !isResults);
  document.getElementById('surprise-btn').classList.toggle('hidden', !isResults);
  document.getElementById('share-btn').classList.toggle('hidden', !isResults);
  document.getElementById('starting-points').classList.toggle('hidden', isResults);

  if (isResults) {
    syncFavBtn();
    if (window.innerWidth < 1024) {
      document.getElementById('sidebar').dataset.sheet = 'half';
    }
  }
}

// ── View toggle (Map ↔ List) ───────────────────────────────
function initViewToggle() {
  document.querySelectorAll('#view-toggle .seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#view-toggle .seg-btn').forEach(b => {
        b.classList.remove('on', 'active');
      });
      btn.classList.add('on', 'active');
      document.getElementById('app').dataset.view = btn.dataset.view;
      if (btn.dataset.view === 'list' && window.innerWidth < 1024) {
        document.getElementById('sidebar').dataset.sheet = 'full';
      }
    });
  });
}

// ── Mobile bottom sheet drag ───────────────────────────────
function initSheetDrag() {
  const sheet = document.getElementById('sidebar');
  const grab  = document.getElementById('sheet-grab');
  if (!grab || !sheet) return;
  const VH = { peek: 14, half: 52, full: 92 };
  let drag = null;

  grab.addEventListener('pointerdown', e => {
    if (window.innerWidth >= 1024) return;
    const startVh = VH[sheet.dataset.sheet || 'half'] || 52;
    drag = { startY: e.clientY, startVh };
    sheet.classList.add('dragging');
    grab.setPointerCapture(e.pointerId);
  });
  window.addEventListener('pointermove', e => {
    if (!drag) return;
    const dy = drag.startY - e.clientY;
    const vh = Math.max(10, Math.min(96, drag.startVh + (dy / window.innerHeight) * 100));
    sheet.style.height = `${vh}vh`;
  });
  window.addEventListener('pointerup', () => {
    if (!drag) return;
    const cur  = parseFloat(sheet.style.height) || VH.half;
    const best = ['peek','half','full']
      .reduce((a, k) => Math.abs(VH[k] - cur) < Math.abs(VH[a] - cur) ? k : a, 'half');
    sheet.style.height = '';
    sheet.dataset.sheet = best;
    sheet.classList.remove('dragging');
    drag = null;
  });
}

// ── UI wiring ──────────────────────────────────────────────
function initUI() {
  // Language
  const langSel  = document.getElementById('lang-select');
  const userLang = navigator.language?.slice(0, 2) || 'nl';
  lang = ['nl', 'en'].includes(userLang) ? userLang : 'nl';
  langSel.value = lang;
  langSel.addEventListener('change', () => { lang = langSel.value; applyTranslations(); });

  // Dark mode
  initDarkMode();

  // Inject SVG glyphs into chip elements
  injectGlyphs();

  // Range slider
  initRangeSlider();

  // View toggle
  initViewToggle();

  // Sheet drag (mobile)
  initSheetDrag();

  // Starting points (initial render)
  renderStartingPoints(currentMode);

  // Apply translations
  applyTranslations();

  // Mode tabs
  document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });

  // Back button
  document.getElementById('back-btn').addEventListener('click', () => {
    allResults = []; lastInnerRing = null; selectedItemId = null;
    markersLayer.clearLayers();
    isoLayer.clearLayers();
    document.getElementById('results-header').classList.add('hidden');
    document.getElementById('results-list').innerHTML = '';
    document.getElementById('cat-filter-section').classList.add('hidden');
    document.getElementById('map-legend').classList.add('hidden');
    document.getElementById('app').dataset.view = '';
    document.querySelectorAll('#view-toggle .seg-btn').forEach((b, i) => {
      b.classList.toggle('on', i === 0); b.classList.toggle('active', i === 0);
    });
    setScreen('home');
  });

  // GPS
  document.getElementById('gps-btn').addEventListener('click', getGPS);

  // Transport
  document.querySelectorAll('.transport-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.transport-btn').forEach(b => {
        b.classList.remove('active', 'on');
      });
      btn.classList.add('active', 'on');
      selectedTransport = btn.dataset.mode;
      updateRangeDisplay();
      renderDonutPreview();
    });
  });

  // Category chips
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      if (selectedCats.has(cat)) { if (selectedCats.size === 1) return; selectedCats.delete(cat); }
      else selectedCats.add(cat);
      syncCatButtons();
    });
  });
  syncCatButtons();

  // Accommodation type
  document.querySelectorAll('.acc-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.acc-type-btn').forEach(b => b.classList.remove('active', 'on'));
      btn.classList.add('active', 'on');
      selectedAccType = btn.dataset.type;
      activeAccFilters.clear(); minStars = 0; minPersons = 0;
      renderAccFilters();
    });
  });

  // Star filter
  document.getElementById('star-btns').addEventListener('click', e => {
    const btn = e.target.closest('.filter-opt-btn'); if (!btn) return;
    document.querySelectorAll('#star-btns .filter-opt-btn').forEach(b => b.classList.remove('active', 'on'));
    btn.classList.add('active', 'on'); minStars = parseInt(btn.dataset.value);
    if (allResults.length && currentMode === 'overnight') renderList();
  });

  // Persons filter
  document.getElementById('persons-btns').addEventListener('click', e => {
    const btn = e.target.closest('.filter-opt-btn'); if (!btn) return;
    document.querySelectorAll('#persons-btns .filter-opt-btn').forEach(b => b.classList.remove('active', 'on'));
    btn.classList.add('active', 'on'); minPersons = parseInt(btn.dataset.value);
    if (allResults.length && currentMode === 'overnight') renderList();
  });

  // Amenity chips
  document.getElementById('acc-amenity-chips').addEventListener('click', e => {
    const chip = e.target.closest('.amenity-chip'); if (!chip) return;
    const id = chip.dataset.id;
    if (activeAccFilters.has(id)) activeAccFilters.delete(id); else activeAccFilters.add(id);
    chip.classList.toggle('active', activeAccFilters.has(id));
    chip.classList.toggle('on',     activeAccFilters.has(id));
    if (allResults.length && currentMode === 'overnight') renderList();
  });

  // Open now
  document.getElementById('open-now-filter').addEventListener('change', e => {
    openNow = e.target.checked;
    if (allResults.length) renderList();
  });

  // Sort
  document.getElementById('sort-select').addEventListener('change', e => {
    currentSort = e.target.value;
    if (allResults.length) renderList();
  });

  // Search
  document.getElementById('search-btn').addEventListener('click', doSearch);

  // Surprise
  document.getElementById('surprise-btn').addEventListener('click', surpriseMe);

  // Favorites filter
  document.getElementById('fav-filter-btn').addEventListener('click', () => {
    showFavOnly = !showFavOnly;
    document.getElementById('fav-filter-btn').classList.toggle('on', showFavOnly);
    if (allResults.length) renderList();
  });

  // Share
  document.getElementById('share-btn').addEventListener('click', shareUrl);

  // Category filter chips (post-search)
  document.getElementById('cat-filter-bar').addEventListener('click', e => {
    const chip = e.target.closest('.cat-filter, .cat-chip'); if (!chip) return;
    const cat = chip.dataset.cat;
    if (visibleCats.has(cat)) { if (visibleCats.size === 1) return; visibleCats.delete(cat); }
    else visibleCats.add(cat);
    syncCatChips(); renderList();
  });

  // Modal close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('detail-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('detail-modal')) closeModal();
  });

  // Fav buttons (delegated from result list)
  document.addEventListener('click', e => {
    const btn = e.target.closest('.card-fav');
    if (!btn) return;
    e.stopPropagation();
    const id = String(btn.dataset.id);
    if (favorites.has(id)) { favorites.delete(id); showToast(t('favRemoved')); }
    else { favorites.add(id); showToast(t('favAdded')); }
    saveFavorites();
    btn.setAttribute('aria-pressed', favorites.has(id));
    syncFavBtn();
  });

  // Autocomplete
  const input = document.getElementById('location-input');
  input.addEventListener('input', () => {
    clearTimeout(acTimer);
    const q = input.value.trim();
    if (q.length < 3) { hideAC(); return; }
    acTimer = setTimeout(() => fetchAC(q), 350);
  });
  input.addEventListener('keydown', e => { if (e.key === 'Escape') hideAC(); });
  document.addEventListener('click', e => { if (!e.target.closest('.autocomplete-wrapper')) hideAC(); });

  // Hash restore
  restoreFromHash();

  // Init acc filters
  renderAccFilters();

  // Normalize 'on' classes on boot
  document.querySelectorAll('.mode-tab.on, .transport-btn.on, .cat-btn.on, .acc-type-btn.on, .filter-opt-btn.on').forEach(el => {
    el.classList.add('active');
  });
}

// ── Mode switching ─────────────────────────────────────────
function switchMode(mode) {
  if (mode === currentMode) return;
  currentMode = mode;

  document.querySelectorAll('.mode-tab').forEach(b => {
    const on = b.dataset.mode === mode;
    b.classList.toggle('active', on);
    b.classList.toggle('on', on);
  });

  const isOvernight = mode === 'overnight';
  document.getElementById('section-activity').classList.toggle('hidden', isOvernight);
  document.getElementById('section-overnight').classList.toggle('hidden', !isOvernight);
  document.getElementById('open-now-wrapper').classList.toggle('hidden', isOvernight);

  // Sort options
  const sortSel = document.getElementById('sort-select');
  let starsOpt = sortSel.querySelector('option[value="stars"]');
  if (isOvernight && !starsOpt) {
    const opt = document.createElement('option');
    opt.value = 'stars'; opt.textContent = t('sortStars');
    sortSel.appendChild(opt);
  } else if (!isOvernight && starsOpt) {
    sortSel.removeChild(starsOpt);
  }
  sortSel.value = 'distance'; currentSort = 'distance';

  // Clear results
  allResults = []; lastInnerRing = null; selectedItemId = null;
  markersLayer.clearLayers(); isoLayer.clearLayers();
  document.getElementById('results-header').classList.add('hidden');
  document.getElementById('results-list').innerHTML = '';
  document.getElementById('cat-filter-section').classList.add('hidden');
  document.getElementById('map-legend').classList.add('hidden');
  if (document.getElementById('app').dataset.screen === 'results') setScreen('home');

  // Update starting points
  renderStartingPoints(mode);
}

// ── Accommodation filters ──────────────────────────────────
function renderAccFilters() {
  const typeInfo   = ACC_TYPE_MAP[selectedAccType];
  const chipCont   = document.getElementById('acc-amenity-chips');
  const starSec    = document.getElementById('star-filter-section');
  const personsSec = document.getElementById('persons-filter-section');
  const filterLbls = t('filterLabels') || {};

  chipCont.innerHTML = typeInfo.filters.map(f => {
    const label  = filterLbls[f.id] || f.id;
    const active = activeAccFilters.has(f.id);
    return `<button class="amenity-chip chiplabel${active ? ' active on' : ''}" data-id="${f.id}">${label}</button>`;
  }).join('');

  starSec.classList.toggle('hidden', !typeInfo.hasStars);
  personsSec.classList.toggle('hidden', !typeInfo.hasPersons);
  document.querySelectorAll('#star-btns .filter-opt-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  document.querySelectorAll('#persons-btns .filter-opt-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  minStars = 0; minPersons = 0;
}

// ── GPS ────────────────────────────────────────────────────
function getGPS() {
  if (!navigator.geolocation) { showToast(t('gpsUnavail')); return; }
  const btn = document.getElementById('gps-btn');
  btn.classList.add('loading');
  navigator.geolocation.getCurrentPosition(
    pos => {
      btn.classList.remove('loading');
      setUserLocation(pos.coords.latitude, pos.coords.longitude, t('myLocation'));
      showToast(t('gpsFound'));
    },
    () => { btn.classList.remove('loading'); showToast(t('gpsFailed')); },
    { timeout: 10000 }
  );
}

function setUserLocation(lat, lon, label) {
  userLocation = { lat, lon };
  document.getElementById('location-input').value = label;
  map.setView([lat, lon], 11);
}

// ── Autocomplete ───────────────────────────────────────────
async function fetchAC(q) {
  try {
    const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}&accept-language=${lang}`);
    const data = await res.json();
    const list = document.getElementById('autocomplete-list');
    list.innerHTML = '';
    if (!data.length) { list.classList.add('hidden'); return; }
    data.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.display_name;
      li.addEventListener('click', () => {
        setUserLocation(parseFloat(item.lat), parseFloat(item.lon), item.display_name);
        hideAC();
      });
      list.appendChild(li);
    });
    list.classList.remove('hidden');
  } catch {}
}

function hideAC() { document.getElementById('autocomplete-list').classList.add('hidden'); }

async function geocode(q) {
  const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}&accept-language=${lang}`);
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), label: data[0].display_name };
}

// ── Main search ────────────────────────────────────────────
async function doSearch() {
  if (!userLocation) {
    const q = document.getElementById('location-input').value.trim();
    if (!q) { showToast(t('enterLocation')); return; }
    showToast(t('searching2'));
    try {
      const r = await geocode(q);
      if (!r) { showToast(t('locationNotFound')); return; }
      setUserLocation(r.lat, r.lon, r.label);
    } catch { showToast(t('lookupFailed')); return; }
  }

  const maxMin = getEffectiveMax();
  const minMin = getEffectiveMin();
  const hasDonut = minMin > 0;
  setSearching(true);
  allResults = []; lastInnerRing = null; selectedItemId = null;

  try {
    let outerPolyStr  = null;
    let outerRingCoords = null;
    let usedFallback  = false;
    const isLarge    = maxMin > 90;
    const generalize = maxMin > 90 ? 150 : 80;

    try {
      const outerIso = await fetchIsochrone(userLocation, maxMin, selectedTransport, generalize, isLarge ? 20000 : 14000);
      outerRingCoords = extractRingCoords(outerIso);
      outerPolyStr   = coordsToOverpassPoly(outerRingCoords, maxMin);

      if (hasDonut) {
        try {
          const innerIso = await fetchIsochrone(userLocation, minMin, selectedTransport, generalize, 12000);
          lastInnerRing  = extractRingCoords(innerIso);
          drawDonut(outerRingCoords, lastInnerRing);
        } catch {
          lastInnerRing = null;
          drawSingleIsochrone(outerRingCoords);
        }
      } else {
        lastInnerRing = null;
        drawSingleIsochrone(outerRingCoords);
      }
    } catch (err) {
      console.warn('Valhalla fallback:', err.message);
      usedFallback = true;
      drawCircleFallback(userLocation, minutesToMeters(maxMin, selectedTransport));
    }

    // Legend
    const legend = document.getElementById('map-legend');
    if (hasDonut && lastInnerRing) legend.classList.remove('hidden');
    else legend.classList.add('hidden');

    const radiusM = usedFallback ? minutesToMeters(maxMin, selectedTransport) : null;

    if (currentMode === 'activity') {
      const cats       = [...selectedCats];
      const rawResults = await Promise.all(
        cats.map(cat => fetchActivityPlaces(cat, outerPolyStr, userLocation, radiusM, isLarge))
      );
      allResults  = processActivityResults(rawResults.flat(), userLocation);
      visibleCats = new Set(cats);
      syncCatChips();
    } else {
      const raw  = await fetchOvernightPlaces(selectedAccType, outerPolyStr, userLocation, radiusM, isLarge);
      allResults = processOvernightResults(raw, userLocation, selectedAccType);
    }

    if (hasDonut && lastInnerRing) {
      allResults = allResults.filter(item => !pointInPolygon(item.lon, item.lat, lastInnerRing));
    }

    const modeLabel = usedFallback ? t('approxCircle') : `${t('roadNetwork')} · ${(t('transportLabel') || {})[selectedTransport] || selectedTransport}`;
    const minLabel  = hasDonut ? `${t('from')} ${formatTravelTime(minMin)} ` : '';
    document.getElementById('radius-info').textContent =
      `${minLabel}${t('to')} ${formatTravelTime(maxMin)} · ${modeLabel}`;
    document.getElementById('results-header').classList.remove('hidden');

    setScreen('results');
    renderList();
    saveToHash();

  } catch (err) {
    console.error(err);
    showToast(t('searchFailed'));
  } finally {
    setSearching(false);
  }
}

// ── Isochrone ──────────────────────────────────────────────
async function fetchIsochrone(loc, minutes, mode, generalize, timeoutMs) {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), timeoutMs || 14000);
  try {
    const res = await fetch(VALHALLA, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locations:  [{ lat: loc.lat, lon: loc.lon }],
        costing:    COSTING[mode],
        contours:   [{ time: minutes }],
        polygons:   true,
        denoise:    0.5,
        generalize: generalize || 80,
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

function extractRingCoords(geojson) {
  const feature = geojson.features?.[0];
  if (!feature) throw new Error('No isochrone feature');
  return feature.geometry.type === 'Polygon'
    ? feature.geometry.coordinates[0]
    : feature.geometry.coordinates[0][0];
}

function coordsToOverpassPoly(ring, minutes) {
  const maxPoints = minutes > 90 ? 60 : 80;
  const step = Math.max(1, Math.floor(ring.length / maxPoints));
  return ring.filter((_, i) => i % step === 0)
    .map(([lon, lat]) => `${lat.toFixed(5)} ${lon.toFixed(5)}`).join(' ');
}

function drawSingleIsochrone(ring) {
  isoLayer.clearLayers();
  const latlngs = ring.map(([lon, lat]) => [lat, lon]);
  L.polygon(latlngs, {
    color: 'oklch(0.58 0.14 35)', fillColor: 'oklch(0.58 0.14 35)',
    fillOpacity: 0.12, weight: 1.5,
  }).addTo(isoLayer);
  addUserMarker();
  try { map.fitBounds(L.latLngBounds(latlngs), { padding: [30, 30] }); } catch {}
}

function drawDonut(outerRing, innerRing) {
  isoLayer.clearLayers();
  const outer = outerRing.map(([lon, lat]) => [lat, lon]);
  const inner = innerRing.map(([lon, lat]) => [lat, lon]);
  L.polygon([outer, inner], {
    color: 'oklch(0.58 0.14 35)', fillColor: 'oklch(0.58 0.14 35)',
    fillOpacity: 0.12, weight: 1.5,
  }).addTo(isoLayer);
  L.polyline(inner, { color: 'oklch(0.58 0.14 35)', weight: 1.5, dashArray: '5 5', opacity: 0.8 }).addTo(isoLayer);
  addUserMarker();
  try { map.fitBounds(L.latLngBounds(outer), { padding: [30, 30] }); } catch {}
}

function drawCircleFallback(loc, radiusM) {
  isoLayer.clearLayers();
  L.circle([loc.lat, loc.lon], {
    radius: radiusM, color: 'oklch(0.58 0.14 35)', fillColor: 'oklch(0.58 0.14 35)',
    fillOpacity: 0.12, weight: 1.5,
  }).addTo(isoLayer);
  addUserMarker();
}

function addUserMarker() {
  const originHtml = '<span class="pin-origin"></span>';
  L.marker([userLocation.lat, userLocation.lon], {
    icon: L.divIcon({ html: originHtml, className: '', iconSize: [16, 16], iconAnchor: [8, 8] }),
    zIndexOffset: 2000,
  }).bindPopup(`<b>${escHtml(t('myLocation'))}</b>`).addTo(isoLayer);
}

// ── Point in polygon ───────────────────────────────────────
function pointInPolygon(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi))
      inside = !inside;
  }
  return inside;
}

// ── Overpass: activity ─────────────────────────────────────
async function fetchActivityPlaces(cat, polyStr, loc, radiusM, isLarge) {
  const catInfo = CATEGORY_MAP[cat];
  const filter  = buildFilter(polyStr, loc, radiusM);
  const timeout = isLarge ? 90 : 30;
  const lines   = catInfo.queries.map(q => `  ${q}${filter};`).join('\n');
  const query   = `[out:json][timeout:${timeout}];\n(\n${lines}\n);\nout center tags;`;
  const res     = await fetch(OVERPASS, { method: 'POST', body: query });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const data    = await res.json();
  return (data.elements || []).map(el => ({ ...el, _cat: cat }));
}

// ── Overpass: overnight ────────────────────────────────────
async function fetchOvernightPlaces(accType, polyStr, loc, radiusM, isLarge) {
  const typeInfo = ACC_TYPE_MAP[accType];
  const filter   = buildFilter(polyStr, loc, radiusM);
  const timeout  = isLarge ? 90 : 60;
  const lines    = typeInfo.osmQueries.map(q => `  ${q}${filter};`).join('\n');
  const query    = `[out:json][timeout:${timeout}];\n(\n${lines}\n);\nout center tags;`;
  const res      = await fetch(OVERPASS, { method: 'POST', body: query });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const data     = await res.json();
  return data.elements || [];
}

function buildFilter(polyStr, loc, radiusM) {
  if (polyStr) return `(poly:"${polyStr}")`;
  return `(around:${Math.ceil(radiusM)},${loc.lat},${loc.lon})`;
}

// ── Process: activity ──────────────────────────────────────
function processActivityResults(elements, loc) {
  const seen = new Set();
  return elements.map(el => {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (!lat || !lon) return null;
    const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    if (seen.has(key)) return null;
    seen.add(key);
    const tags     = el.tags || {};
    const cat      = el._cat;
    const catInfo  = CATEGORY_MAP[cat];
    const catLabel = (t('catLabels') || {})[cat] || cat;
    return {
      id: el.id, type: el.type, cat,
      catInfo: { ...catInfo, label: catLabel },
      name: tags.name || tags['name:nl'] || `(${catLabel})`,
      lat, lon,
      dist:     haversineKm(loc.lat, loc.lon, lat, lon),
      tags, openStat: getOpenStatus(tags), rating: parseRating(tags),
    };
  }).filter(Boolean);
}

// ── Process: overnight ─────────────────────────────────────
function processOvernightResults(elements, loc, accType) {
  const typeInfo  = ACC_TYPE_MAP[accType];
  const accLabel  = (t('accLabels') || {})[accType] || accType;
  const seen      = new Set();
  return elements.map(el => {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (!lat || !lon) return null;
    const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    if (seen.has(key)) return null;
    seen.add(key);
    const tags      = el.tags || {};
    const amenLbls  = t('amenityLabels') || {};
    const amenIcons = typeInfo.amenityIcons
      .filter(a => a.checkFn(tags))
      .map(a => ({ icon: a.icon, label: amenLbls[a.labelKey] || a.labelKey }));
    return {
      id: el.id, type: el.type, cat: accType,
      catInfo: { label: accLabel, icon: typeInfo.icon, color: typeInfo.color },
      name: tags.name || tags['name:nl'] || `(${accLabel})`,
      lat, lon,
      dist:     haversineKm(loc.lat, loc.lon, lat, lon),
      tags,
      stars:    parseFloat(tags.stars) || null,
      capacity: parseInt(tags.capacity) || parseInt(tags['capacity:persons']) || null,
      amenIcons,
      openStat: getOpenStatus(tags),
      rating:   parseRating(tags),
      accType,
    };
  }).filter(Boolean);
}

// ── Render list ────────────────────────────────────────────
function renderList() {
  markersLayer.clearLayers();
  const list = document.getElementById('results-list');
  list.innerHTML = '';

  let items;
  if (currentMode === 'activity') {
    items = allResults.filter(i => visibleCats.has(i.cat));
    if (openNow) items = items.filter(i => i.openStat === 'open');
  } else {
    items = applyOvernightFilters(allResults);
  }
  if (showFavOnly) items = items.filter(i => favorites.has(String(i.id)));

  if (currentSort === 'distance')    items.sort((a, b) => a.dist - b.dist);
  else if (currentSort === 'rating') items.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
  else if (currentSort === 'stars')  items.sort((a, b) => (b.stars ?? -1) - (a.stars ?? -1));
  else                               items.sort((a, b) => a.name.localeCompare(b.name, lang));

  const count   = items.length;
  const locWord = count === 1 ? t('locations') : t('locationsPlural');
  document.getElementById('results-count').textContent = count;

  if (!count) {
    list.innerHTML = `<li class="empty-state">
      <h3 class="empty-title">${escHtml(t('noResults'))}</h3>
      <p class="empty-body">${escHtml(t('noResultsSub'))}</p>
    </li>`;
    return;
  }

  const cap = 100;
  items.slice(0, cap).forEach((item, idx) => {
    const isSelected = item.id == selectedItemId;
    const pin = makePin(item, idx, isSelected);
    const marker = L.marker([item.lat, item.lon], { icon: pin, zIndexOffset: isSelected ? 1000 : 0 })
      .bindPopup(makePopupHtml(item)).addTo(markersLayer);

    marker.on('click', () => {
      selectedItemId = item.id;
      highlightItem(item.id);
      showDetailModal(item);
    });

    const li = document.createElement('li');
    li.className = `result-item card ${currentMode === 'overnight' ? 'stay' : 'day'}${isSelected ? ' selected' : ''}`;
    li.dataset.id = item.id;

    li.innerHTML = currentMode === 'overnight'
      ? buildOvernightCardHTML(item, idx, isSelected)
      : buildActivityCardHTML(item, idx, isSelected);

    li.addEventListener('click', () => {
      selectedItemId = item.id;
      map.setView([item.lat, item.lon], 15);
      marker.openPopup();
      highlightItem(item.id);
      showDetailModal(item);
    });
    list.appendChild(li);
  });

  if (items.length > cap) {
    const note = document.createElement('li');
    note.style.cssText = 'text-align:center;color:var(--ink-3);font-size:11px;padding:16px;font-family:var(--mono);';
    note.textContent   = t('moreResults').replace('{n}', items.length - cap);
    list.appendChild(note);
  }
}

function buildActivityCardHTML(item, idx, isSelected) {
  const isFav  = favorites.has(String(item.id));
  const numEl  = isSelected ? `<span class="card-num">${idx + 1}</span>` : '';
  const openEl = item.openStat === 'open'
    ? `<span class="card-chip moss">${t('openStatus')}</span>`
    : item.openStat === 'closed'
      ? `<span class="card-chip subtle">${t('closedStatus')}</span>`
      : '';
  return `
    <div class="card-photo">
      <span class="ph-label">FOTO</span>
      <button class="card-fav" aria-pressed="${isFav}" data-id="${item.id}">${svgGlyph('favoriet', 14)}</button>
      ${numEl}
    </div>
    <div class="card-body">
      <h3 class="card-name">${escHtml(item.name)}</h3>
      <div class="card-data">${formatDist(item.dist)} · ${escHtml(item.catInfo.label)}</div>
      <div class="card-tags">
        ${openEl}
        ${item.rating ? `<span class="card-chip">${item.rating} ★</span>` : ''}
      </div>
    </div>`;
}

function buildOvernightCardHTML(item, idx, isSelected) {
  const isFav  = favorites.has(String(item.id));
  const numEl  = isSelected ? `<span class="card-num">${idx + 1}</span>` : '';
  const amenEl = item.amenIcons.slice(0, 4).map(a =>
    `<span class="card-chip" title="${escHtml(a.label)}">${a.icon}</span>`).join('');
  return `
    <div class="stay-photo">
      <span class="ph-label">FOTO</span>
      <button class="card-fav" aria-pressed="${isFav}" data-id="${item.id}">${svgGlyph('favoriet', 14)}</button>
      ${numEl}
    </div>
    <div class="card-body">
      <h3 class="card-name">${escHtml(item.name)}</h3>
      <div class="card-data">${formatDist(item.dist)}${item.stars ? ` · ${item.stars}★` : ''}${item.capacity ? ` · ${item.capacity} pers.` : ''}</div>
      <div class="card-tags">${amenEl}</div>
    </div>`;
}

// ── Pin variants ───────────────────────────────────────────
function makePin(item, idx, isSelected) {
  const glyphKey = CAT_GLYPH[item.cat] || ACC_GLYPH[item.cat] || '';
  const glyph    = svgGlyph(glyphKey, 16);
  let html, w, h;
  if (isSelected) {
    html = `<span class="pin-selected">${idx + 1}</span>`;
    w = h = 36;
  } else {
    html = `<span class="pin-typed">${glyph}</span>`;
    w = h = 30;
  }
  return L.divIcon({ html, className: '', iconSize: [w, h], iconAnchor: [w / 2, h / 2] });
}

// ── Overnight filters ──────────────────────────────────────
function applyOvernightFilters(items) {
  return items.filter(item => {
    for (const id of activeAccFilters) {
      const def = ACC_TYPE_MAP[selectedAccType].filters.find(f => f.id === id);
      if (def && !def.checkFn(item.tags)) return false;
    }
    if (minStars > 0 && (!item.stars || item.stars < minStars)) return false;
    if (minPersons > 0 && (item.capacity || 0) < minPersons) return false;
    return true;
  });
}

// ── Category chips (post-search) ───────────────────────────
function syncCatButtons() {
  document.querySelectorAll('.cat-btn').forEach(btn => {
    const active = selectedCats.has(btn.dataset.cat);
    btn.classList.toggle('active', active);
    btn.classList.toggle('on', active);
  });
}

function syncCatChips() {
  const bar     = document.getElementById('cat-filter-bar');
  const section = document.getElementById('cat-filter-section');
  const cats    = [...selectedCats];
  if (cats.length <= 1 || currentMode !== 'activity') { section.classList.add('hidden'); return; }
  section.classList.remove('hidden');
  const counts = {};
  allResults.forEach(r => { counts[r.cat] = (counts[r.cat] || 0) + 1; });
  bar.innerHTML = cats.map(cat => {
    const label  = (t('catLabels') || {})[cat] || cat;
    const active = visibleCats.has(cat);
    const gKey   = CAT_GLYPH[cat];
    return `<button class="cat-filter${active ? ' on' : ''}" data-cat="${cat}">
      ${gKey ? `<span class="chip-glyph">${svgGlyph(gKey, 12)}</span>` : ''}
      ${escHtml(label)} · ${counts[cat] || 0}
    </button>`;
  }).join('');
}

// ── Highlight ──────────────────────────────────────────────
function highlightItem(id) {
  document.querySelectorAll('.result-item').forEach(el =>
    el.classList.toggle('selected', el.dataset.id == id));
  const el = document.querySelector(`.result-item[data-id="${id}"]`);
  if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// ── Surprise me ────────────────────────────────────────────
function surpriseMe() {
  let pool = currentMode === 'activity'
    ? allResults.filter(i => visibleCats.has(i.cat) && (!openNow || i.openStat === 'open'))
    : applyOvernightFilters(allResults);
  if (showFavOnly) pool = pool.filter(i => favorites.has(String(i.id)));
  if (!pool.length) { showToast(t('noSurprise')); return; }
  const item = pool[Math.floor(Math.random() * pool.length)];
  selectedItemId = item.id;
  map.setView([item.lat, item.lon], 15);
  highlightItem(item.id);
  showDetailModal(item);
}

// ── Detail modal ───────────────────────────────────────────
function showDetailModal(item) {
  const tags    = item.tags;
  const osmUrl  = `https://www.openstreetmap.org/${item.type}/${item.id}`;
  const website = tags.website || tags['contact:website'];
  const phone   = tags.phone   || tags['contact:phone'];
  const address = buildAddress(tags);
  const hours   = tags.opening_hours;
  const isFav   = favorites.has(String(item.id));
  const isStay  = currentMode === 'overnight';
  const glyphKey = isStay ? (ACC_GLYPH[item.accType] || '') : (CAT_GLYPH[item.cat] || '');

  const dataParts = [
    formatDist(item.dist),
    item.rating ? `★ ${item.rating}` : null,
    item.stars  ? `${item.stars} ★` : null,
    item.capacity ? `${item.capacity} pers.` : null,
  ].filter(Boolean);

  const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lon}`;
  const amaps = `https://maps.apple.com/?daddr=${item.lat},${item.lon}`;

  const actionBtn = isStay
    ? buildBookingLinksSimple(item)
    : `<a class="btn-primary" href="${gmaps}" target="_blank" rel="noopener noreferrer">🗺️ ${t('route')}</a>`;

  let html = `
    <div class="modal-photo${isStay ? ' wide' : ''}">
      <span class="ph-label">FOTO · ${isStay ? '16:9' : '1:1'}</span>
    </div>
    <div class="modal-body-inner">
      ${glyphKey ? `<div class="modal-glyph">${svgGlyph(glyphKey, 20)}</div>` : ''}
      <h2 class="modal-name">${escHtml(item.name)}</h2>
      <div class="modal-data">${dataParts.join(' · ')}</div>
      ${address ? `<div class="modal-addr">📍 ${escHtml(address)}</div>` : ''}
      ${hours   ? `<div class="modal-addr">🕐 ${escHtml(hours)}</div>` : ''}
      ${phone   ? `<div class="modal-addr">📞 <a href="tel:${escHtml(phone)}">${escHtml(phone)}</a></div>` : ''}
      ${website ? `<div class="modal-addr">🌐 <a href="${escHtml(website)}" target="_blank" rel="noopener noreferrer">${escHtml(website)}</a></div>` : ''}
      ${item.amenIcons?.length ? `<div class="modal-tags">${item.amenIcons.map(a => `<span class="card-chip">${a.icon} ${escHtml(a.label)}</span>`).join('')}</div>` : ''}
      <div class="modal-actions">
        ${actionBtn}
        ${!isStay ? `<a class="btn-secondary" href="${amaps}" target="_blank" rel="noopener noreferrer">🍎 Apple Maps</a>` : ''}
        <button class="btn-secondary modal-fav-btn${isFav ? ' active' : ''}" data-id="${item.id}">
          ${svgGlyph('favoriet', 14)} ${isFav ? t('favRemoved') : t('bewaren')}
        </button>
      </div>
      <div style="margin-top:var(--s3)">
        <a href="${osmUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--ink-3);font-family:var(--mono);font-size:10px;letter-spacing:.04em">${t('viewOnOSM')}</a>
      </div>
    </div>`;

  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('detail-modal').classList.remove('hidden');

  document.querySelector('.modal-fav-btn')?.addEventListener('click', function () {
    const id = String(this.dataset.id);
    if (favorites.has(id)) { favorites.delete(id); }
    else { favorites.add(id); }
    saveFavorites();
    this.classList.toggle('active', favorites.has(id));
    this.innerHTML = `${svgGlyph('favoriet', 14)} ${favorites.has(id) ? t('favRemoved') : t('bewaren')}`;
    syncFavBtn();
    const listBtn = document.querySelector(`.card-fav[data-id="${id}"]`);
    if (listBtn) listBtn.setAttribute('aria-pressed', favorites.has(id));
  });
}

function buildBookingLinksSimple(item) {
  const lat = item.lat.toFixed(5);
  const lon = item.lon.toFixed(5);
  if (item.accType === 'vakantiewoning') {
    return `<a class="btn-primary" href="https://www.airbnb.nl/s/homes?ne_lat=${(item.lat+0.3).toFixed(4)}&ne_lng=${(item.lon+0.4).toFixed(4)}&sw_lat=${(item.lat-0.3).toFixed(4)}&sw_lng=${(item.lon-0.4).toFixed(4)}" target="_blank" rel="noopener noreferrer">🏡 Airbnb</a>`;
  }
  if (item.accType === 'camping') {
    return `<a class="btn-primary" href="https://www.anwb.nl/campings" target="_blank" rel="noopener noreferrer">🏕️ ANWB</a>
            <a class="btn-secondary" href="https://www.booking.com/searchresults.html?latitude=${lat}&longitude=${lon}" target="_blank" rel="noopener noreferrer">📅 Booking</a>`;
  }
  return `<a class="btn-primary" href="https://www.booking.com/searchresults.html?latitude=${lat}&longitude=${lon}" target="_blank" rel="noopener noreferrer">📅 Booking</a>`;
}

function closeModal() { document.getElementById('detail-modal').classList.add('hidden'); }

// ── Favorites ──────────────────────────────────────────────
function loadFavorites() {
  try { return new Set(JSON.parse(localStorage.getItem('lz_favorites') || '[]')); }
  catch { return new Set(); }
}
function saveFavorites() {
  localStorage.setItem('lz_favorites', JSON.stringify([...favorites]));
}
function syncFavBtn() {
  const btn    = document.getElementById('fav-filter-btn');
  const hasFav = allResults.some(r => favorites.has(String(r.id)));
  btn.classList.toggle('hidden', !hasFav);
}

// ── Share URL ──────────────────────────────────────────────
function saveToHash() {
  if (!userLocation) return;
  const params = new URLSearchParams({
    lat: userLocation.lat.toFixed(5),
    lon: userLocation.lon.toFixed(5),
    mode: currentMode,
    transport: selectedTransport,
    tmin: document.getElementById('time-min').value,
    tmax: document.getElementById('time-max').value,
    lang,
  });
  if (currentMode === 'activity') params.set('cats', [...selectedCats].join(','));
  else params.set('acc', selectedAccType);
  history.replaceState(null, '', '#' + params.toString());
}

function restoreFromHash() {
  if (!location.hash || location.hash.length < 2) return;
  try {
    const p = new URLSearchParams(location.hash.slice(1));
    if (p.get('lat') && p.get('lon')) {
      userLocation = { lat: parseFloat(p.get('lat')), lon: parseFloat(p.get('lon')) };
      document.getElementById('location-input').value =
        `${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}`;
      map.setView([userLocation.lat, userLocation.lon], 11);
    }
    if (p.get('lang') && ['nl','en'].includes(p.get('lang'))) {
      lang = p.get('lang');
      document.getElementById('lang-select').value = lang;
    }
    if (p.get('mode')) switchMode(p.get('mode'));
    if (p.get('transport')) {
      selectedTransport = p.get('transport');
      document.querySelectorAll('.transport-btn').forEach(b => {
        const on = b.dataset.mode === selectedTransport;
        b.classList.toggle('active', on); b.classList.toggle('on', on);
      });
    }
    if (p.get('tmin')) document.getElementById('time-min').value = p.get('tmin');
    if (p.get('tmax')) document.getElementById('time-max').value = p.get('tmax');
    updateRangeDisplay(); updateRangeFill(); renderDonutPreview();
    if (p.get('cats')) {
      selectedCats = new Set(p.get('cats').split(',').filter(c => CATEGORY_MAP[c]));
      syncCatButtons();
    }
    if (p.get('acc') && ACC_TYPE_MAP[p.get('acc')]) {
      selectedAccType = p.get('acc');
      document.querySelectorAll('.acc-type-btn').forEach(b => {
        const on = b.dataset.type === selectedAccType;
        b.classList.toggle('active', on); b.classList.toggle('on', on);
      });
      renderAccFilters();
    }
  } catch(e) { console.warn('Hash restore failed', e); }
}

async function shareUrl() {
  saveToHash();
  const url = location.href;
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      showToast(t('linkCopied'));
    } else if (navigator.share) {
      await navigator.share({ url });
    } else {
      showToast(t('linkFailed'));
    }
  } catch { showToast(t('linkFailed')); }
}

// ── Helpers ────────────────────────────────────────────────
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371, dLat = toRad(lat2-lat1), dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

const toRad           = d  => d * Math.PI / 180;
const formatDist      = km => km < 1 ? `${Math.round(km*1000)} m` : `${km.toFixed(1)} km`;
const minutesToMeters = (min, mode) => Math.ceil((SPEEDS[mode] * min / 60) * 1000);

function formatTravelTime(minutes) {
  if (minutes === 0) return `0 ${t('min')}`;
  if (minutes < 60)  return `${minutes} ${t('min')}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} ${t('hour')}`;
  return `${h}u ${m}m`;
}

function getOpenStatus(tags) {
  const oh = tags.opening_hours;
  if (!oh) return 'unknown';
  if (oh === '24/7') return 'open';
  try { return evaluateOpeningHours(oh) ? 'open' : 'closed'; }
  catch { return 'unknown'; }
}

function evaluateOpeningHours(oh) {
  const now   = new Date();
  const DAYS  = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const ORDER = { Mo:1,Tu:2,We:3,Th:4,Fr:5,Sa:6,Su:7 };
  const today = ORDER[DAYS[now.getDay()]];
  const nowM  = now.getHours()*60 + now.getMinutes();
  for (const rule of oh.split(';').map(r=>r.trim()).filter(Boolean)) {
    const m = rule.match(/^([A-Za-z,\- ]+?)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
    if (!m || !dayMatches(m[1].trim(), today, ORDER)) continue;
    const s = timeToMin(m[2]), e = timeToMin(m[3]);
    if (e < s) return nowM >= s || nowM < e;
    return nowM >= s && nowM < e;
  }
  return false;
}

function dayMatches(part, today, order) {
  return part.split(',').map(s=>s.trim()).some(p => {
    const range = p.match(/^([A-Z][a-z])-([A-Z][a-z])$/);
    if (range) { const s=order[range[1]],e=order[range[2]]; return s&&e&&today>=s&&today<=e; }
    return order[p] === today;
  });
}

const timeToMin = t => { const [h,m]=t.split(':').map(Number); return h*60+m; };

function parseRating(tags) {
  const r = tags.stars || tags.rating;
  if (!r) return null;
  const n = parseFloat(r);
  return isNaN(n) ? null : n;
}

function buildAddress(tags) {
  const street = tags['addr:street'] && tags['addr:housenumber']
    ? `${tags['addr:street']} ${tags['addr:housenumber']}`
    : tags['addr:street'];
  return [street, tags['addr:city'] || tags['addr:town']].filter(Boolean).join(', ');
}

function makePopupHtml(item) {
  const gKey = CAT_GLYPH[item.cat] || ACC_GLYPH[item.cat];
  return `
    <div class="popup-name">${escHtml(item.name)}</div>
    <div style="color:var(--ink-3);font-family:var(--mono);font-size:11px;margin-top:2px">
      ${gKey ? svgGlyph(gKey, 12) : ''} ${escHtml(item.catInfo.label)} · ${formatDist(item.dist)}
    </div>
    ${item.openStat !== 'unknown' ? `<div style="font-family:var(--mono);font-size:11px;font-weight:500;margin-top:4px;color:${item.openStat==='open'?'var(--moss)':'#b91c1c'}">● ${item.openStat==='open'?t('openStatus'):t('closedStatus')}</div>` : ''}`;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function setSearching(on) {
  const btn = document.getElementById('search-btn');
  btn.disabled = on;
  btn.innerHTML = on
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> <span>${t('searching')}</span>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg> <span data-i18n="search">${t('search')}</span>`;
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ── Boot ───────────────────────────────────────────────────
initMap();
initUI();
