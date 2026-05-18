'use strict';

// ── External APIs ──────────────────────────────────────────
const VALHALLA = 'https://valhalla1.openstreetmap.de/isochrone';
const OVERPASS = 'https://overpass-api.de/api/interpreter';
const COSTING  = { driving: 'auto', cycling: 'bicycle', walking: 'pedestrian' };
const SPEEDS   = { driving: 40, cycling: 15, walking: 5 };

// ── i18n ───────────────────────────────────────────────────
const TRANSLATIONS = {
  nl: {
    title: 'Locatie Zoeker',
    subtitle: 'Ontdek wat er in de buurt is',
    activity: '🗺️ Activiteit',
    overnight: '🌙 Overnachten',
    myLocation: 'Mijn locatie',
    locationPh: 'Typ een adres of stad…',
    travelTime: 'Reistijd',
    transport: 'Vervoersmiddel',
    car: '🚗 Auto',
    bike: '🚲 Fiets',
    walk: '🚶 Lopen',
    whatSearch: 'Wat zoek je?',
    multiplePossible: 'meerdere mogelijk',
    accType: 'Type verblijf',
    minStars: 'Minimaal sterren',
    minPersons: 'Minimaal personen',
    amenities: 'Voorzieningen',
    allOption: 'Alle',
    openNow: 'Nu geopend',
    sortBy: 'Sorteren:',
    sortDist: 'Afstand',
    sortRating: 'Beoordeling',
    sortName: 'Naam',
    sortStars: '⭐ Sterren',
    favorites: 'Favorieten',
    shareLink: 'Deel',
    surpriseMe: 'Verras me',
    legendOuter: 'Max bereikbaar',
    legendInner: 'Min. afstand',
    search: 'Zoeken',
    searching: 'Bezig…',
    noResults: 'Geen resultaten. Pas de filters aan of vergroot de reistijd.',
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
    linkCopied: 'Link gekopieerd naar klembord!',
    linkFailed: 'Kon link niet kopiëren.',
    favAdded: 'Toegevoegd aan favorieten ❤️',
    favRemoved: 'Verwijderd uit favorieten',
    from: 'Van',
    to: 'tot',
    min: 'min',
    hour: 'uur',
    roadNetwork: 'wegennetwerk',
    approxCircle: 'geschatte cirkel',
    fromLocation: 'van jouw locatie',
    capacity: 'Capaciteit',
    persons: 'personen',
    rating: 'Beoordeling',
    stars: 'sterren',
    openStatus: 'Nu open',
    closedStatus: 'Gesloten',
    unknownHours: 'Tijden onbekend',
    searchBookNearby: 'Zoek & boek in de buurt',
    viewOnOSM: 'Bekijk op OpenStreetMap ↗',
    locations: 'locatie',
    locationsPlural: 'locaties',
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
      spa: '💆 Spa/sauna', garden: '🌿 Tuin',
    },
    amenityLabels: {
      Tent: 'Tent', Camper: 'Camper', Caravan: 'Caravan', Elektra: 'Elektra',
      Honden: 'Honden', Zwembad: 'Zwembad', WiFi: 'WiFi', Douches: 'Douches',
      BBQ: 'BBQ', Parkeren: 'Parkeren', Restaurant: 'Restaurant', Bar: 'Bar',
      Spa: 'Spa', Tuin: 'Tuin',
    },
  },
  en: {
    title: 'Location Finder',
    subtitle: 'Discover what\'s nearby',
    activity: '🗺️ Activity',
    overnight: '🌙 Stay overnight',
    myLocation: 'My location',
    locationPh: 'Type an address or city…',
    travelTime: 'Travel time',
    transport: 'Transport',
    car: '🚗 Car',
    bike: '🚲 Bike',
    walk: '🚶 Walk',
    whatSearch: 'What are you looking for?',
    multiplePossible: 'multiple possible',
    accType: 'Accommodation type',
    minStars: 'Minimum stars',
    minPersons: 'Minimum persons',
    amenities: 'Amenities',
    allOption: 'All',
    openNow: 'Open now',
    sortBy: 'Sort:',
    sortDist: 'Distance',
    sortRating: 'Rating',
    sortName: 'Name',
    sortStars: '⭐ Stars',
    favorites: 'Favorites',
    shareLink: 'Share',
    surpriseMe: 'Surprise me',
    legendOuter: 'Max reachable',
    legendInner: 'Min. distance',
    search: 'Search',
    searching: 'Searching…',
    noResults: 'No results. Adjust filters or increase travel time.',
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
    linkCopied: 'Link copied to clipboard!',
    linkFailed: 'Could not copy link.',
    favAdded: 'Added to favorites ❤️',
    favRemoved: 'Removed from favorites',
    from: 'From',
    to: 'to',
    min: 'min',
    hour: 'hour',
    roadNetwork: 'road network',
    approxCircle: 'estimated circle',
    fromLocation: 'from your location',
    capacity: 'Capacity',
    persons: 'persons',
    rating: 'Rating',
    stars: 'stars',
    openStatus: 'Open now',
    closedStatus: 'Closed',
    unknownHours: 'Hours unknown',
    searchBookNearby: 'Search & book nearby',
    viewOnOSM: 'View on OpenStreetMap ↗',
    locations: 'location',
    locationsPlural: 'locations',
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
      spa: '💆 Spa/sauna', garden: '🌿 Garden',
    },
    amenityLabels: {
      Tent: 'Tent', Camper: 'Camper', Caravan: 'Caravan', Elektra: 'Electric',
      Honden: 'Dogs', Zwembad: 'Pool', WiFi: 'WiFi', Douches: 'Showers',
      BBQ: 'BBQ', Parkeren: 'Parking', Restaurant: 'Restaurant', Bar: 'Bar',
      Spa: 'Spa', Tuin: 'Garden',
    },
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
let map, isoLayer, markersLayer;
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

// ── Map init ───────────────────────────────────────────────
function initMap() {
  map = L.map('map').setView([52.3, 5.3], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);
  isoLayer     = L.layerGroup().addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

// ── i18n apply ─────────────────────────────────────────────
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const txt = t(key);
    if (txt) el.textContent = txt;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    const txt = t(key);
    if (txt) el.placeholder = txt;
  });
  document.title = t('title');
  updateRangeDisplay();
  if (allResults.length) renderList();
}

// ── Dark mode ──────────────────────────────────────────────
function initDarkMode() {
  const saved = localStorage.getItem('lz_theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  document.getElementById('dark-toggle').addEventListener('click', () => {
    const cur  = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('lz_theme', next);
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
    if (minV >= maxV) { minEl.value = Math.max(parseInt(minEl.min), maxV - step); minV = parseInt(minEl.value); }
    updateRangeDisplay();
    updateRangeFill();
  };

  minEl.addEventListener('input', update);
  maxEl.addEventListener('input', update);
  update();
  renderTicks();
}

function updateRangeDisplay() {
  const minEl = document.getElementById('time-min');
  const maxEl = document.getElementById('time-max');
  const minV  = parseInt(minEl.value);
  const maxV  = parseInt(maxEl.value);
  const disp  = document.getElementById('range-display');
  if (disp) {
    disp.textContent = `${t('from')} ${formatTravelTime(minV)} ${t('to')} ${formatTravelTime(maxV)}`;
  }
}

function updateRangeFill() {
  const minEl   = document.getElementById('time-min');
  const maxEl   = document.getElementById('time-max');
  const fill    = document.getElementById('range-fill');
  if (!fill) return;
  const minV    = parseInt(minEl.value);
  const maxV    = parseInt(maxEl.value);
  const minPx   = parseInt(minEl.min);
  const maxPx   = parseInt(maxEl.max);
  const leftPct = ((minV - minPx) / (maxPx - minPx)) * 100;
  const rightPct= ((maxV - minPx) / (maxPx - minPx)) * 100;
  fill.style.left  = `${leftPct}%`;
  fill.style.width = `${rightPct - leftPct}%`;
}

function renderTicks() {
  const container = document.getElementById('range-ticks');
  if (!container) return;
  const minEl = document.getElementById('time-min');
  const min   = parseInt(minEl.min);
  const max   = parseInt(minEl.max);
  const step  = parseInt(minEl.step);
  container.innerHTML = '';
  for (let v = min; v <= max; v += step) {
    const pct  = ((v - min) / (max - min)) * 100;
    const span = document.createElement('span');
    span.style.left    = `${pct}%`;
    span.textContent   = formatTravelTime(v);
    container.appendChild(span);
  }
}

function getEffectiveMin() {
  const minV = parseInt(document.getElementById('time-min').value);
  const maxV = parseInt(document.getElementById('time-max').value);
  if (minV > parseInt(document.getElementById('time-min').min)) return minV;
  if (currentMode === 'overnight') return Math.max(0, maxV - 120);
  return 0;
}

function getEffectiveMax() {
  return parseInt(document.getElementById('time-max').value);
}

// ── UI wiring ──────────────────────────────────────────────
function initUI() {
  // Language
  const langSel = document.getElementById('lang-select');
  const userLang = navigator.language?.slice(0, 2) || 'nl';
  lang = ['nl', 'en'].includes(userLang) ? userLang : 'nl';
  langSel.value = lang;
  langSel.addEventListener('change', () => { lang = langSel.value; applyTranslations(); renderTicks(); });
  applyTranslations();

  // Dark mode
  initDarkMode();

  // Range slider
  initRangeSlider();

  // Mode tabs
  document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });

  // GPS
  document.getElementById('gps-btn').addEventListener('click', getGPS);

  // Transport
  document.querySelectorAll('.transport-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.transport-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTransport = btn.dataset.mode;
    });
  });

  // Activity categories
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
      document.querySelectorAll('.acc-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedAccType = btn.dataset.type;
      activeAccFilters.clear(); minStars = 0; minPersons = 0;
      renderAccFilters();
    });
  });

  // Star filter
  document.getElementById('star-btns').addEventListener('click', e => {
    const btn = e.target.closest('.filter-opt-btn'); if (!btn) return;
    document.querySelectorAll('#star-btns .filter-opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); minStars = parseInt(btn.dataset.value);
    if (allResults.length && currentMode === 'overnight') renderList();
  });

  // Persons filter
  document.getElementById('persons-btns').addEventListener('click', e => {
    const btn = e.target.closest('.filter-opt-btn'); if (!btn) return;
    document.querySelectorAll('#persons-btns .filter-opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); minPersons = parseInt(btn.dataset.value);
    if (allResults.length && currentMode === 'overnight') renderList();
  });

  // Amenity chips
  document.getElementById('acc-amenity-chips').addEventListener('click', e => {
    const chip = e.target.closest('.amenity-chip'); if (!chip) return;
    const id = chip.dataset.id;
    if (activeAccFilters.has(id)) activeAccFilters.delete(id); else activeAccFilters.add(id);
    chip.classList.toggle('active', activeAccFilters.has(id));
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

  // Search button
  document.getElementById('search-btn').addEventListener('click', doSearch);

  // Surprise
  document.getElementById('surprise-btn').addEventListener('click', surpriseMe);

  // Favorites filter
  document.getElementById('fav-filter-btn').addEventListener('click', () => {
    showFavOnly = !showFavOnly;
    document.getElementById('fav-filter-btn').classList.toggle('active', showFavOnly);
    if (allResults.length) renderList();
  });

  // Share
  document.getElementById('share-btn').addEventListener('click', shareUrl);

  // Category filter chips (post-search)
  document.getElementById('cat-filter-bar').addEventListener('click', e => {
    const chip = e.target.closest('.cat-chip'); if (!chip) return;
    const cat = chip.dataset.cat;
    if (visibleCats.has(cat)) { if (visibleCats.size === 1) return; visibleCats.delete(cat); }
    else visibleCats.add(cat);
    syncCatChips(); renderList();
  });

  // Modal
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('detail-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('detail-modal')) closeModal();
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

  // Init acc filters for default type
  renderAccFilters();
}

// ── Mode switching ─────────────────────────────────────────
function switchMode(mode) {
  if (mode === currentMode) return;
  currentMode = mode;
  document.querySelectorAll('.mode-tab').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));

  const isActivity  = mode === 'activity';
  const isOvernight = mode === 'overnight';

  document.getElementById('section-activity').classList.toggle('hidden', isOvernight);
  document.getElementById('section-overnight').classList.toggle('hidden', isActivity);
  document.getElementById('open-now-wrapper').classList.toggle('hidden', isOvernight);

  // Adjust slider range
  const minEl = document.getElementById('time-min');
  const maxEl = document.getElementById('time-max');
  if (isOvernight) {
    minEl.min = '0'; minEl.max = '660'; minEl.step = '30'; minEl.value = '0';
    maxEl.min = '30'; maxEl.max = '720'; maxEl.step = '30'; maxEl.value = '120';
  } else {
    minEl.min = '0'; minEl.max = '55'; minEl.step = '5'; minEl.value = '0';
    maxEl.min = '5'; maxEl.max = '60'; maxEl.step = '5'; maxEl.value = '15';
  }
  updateRangeDisplay(); updateRangeFill(); renderTicks();

  // Sort options
  const sortSel = document.getElementById('sort-select');
  let starsOpt = sortSel.querySelector('option[value="stars"]');
  if (isOvernight && !starsOpt) {
    const opt = document.createElement('option');
    opt.value = 'stars'; opt.dataset.i18n = 'sortStars'; opt.textContent = t('sortStars');
    sortSel.appendChild(opt);
  } else if (isActivity && starsOpt) {
    sortSel.removeChild(starsOpt);
  }
  sortSel.value = 'distance'; currentSort = 'distance';

  // Clear results
  allResults = []; lastInnerRing = null;
  markersLayer.clearLayers(); isoLayer.clearLayers();
  document.getElementById('results-header').classList.add('hidden');
  document.getElementById('results-list').innerHTML = '';
  document.getElementById('cat-filter-section').classList.add('hidden');
  document.getElementById('map-legend').classList.add('hidden');
}

// ── Accommodation filters ──────────────────────────────────
function renderAccFilters() {
  const typeInfo   = ACC_TYPE_MAP[selectedAccType];
  const chipCont   = document.getElementById('acc-amenity-chips');
  const starSec    = document.getElementById('star-filter-section');
  const personsSec = document.getElementById('persons-filter-section');

  chipCont.innerHTML = typeInfo.filters.map(f => {
    const label = (t('filterLabels') || {})[f.id] || f.id;
    return `<button class="amenity-chip${activeAccFilters.has(f.id) ? ' active' : ''}" data-id="${f.id}">${label}</button>`;
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
  allResults = []; lastInnerRing = null;

  try {
    // 1. Outer isochrone
    let outerPolyStr  = null;
    let outerRingCoords = null;
    let usedFallback  = false;

    const isLarge = maxMin > 180;
    const generalize = maxMin > 480 ? 400 : isLarge ? 200 : 80;

    try {
      const outerIso = await fetchIsochrone(userLocation, maxMin, selectedTransport, generalize, isLarge ? 20000 : 14000);
      outerRingCoords = extractRingCoords(outerIso);
      outerPolyStr   = coordsToOverpassPoly(outerRingCoords, maxMin);

      // 2. Inner isochrone for donut
      if (hasDonut && minMin > 0) {
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

    // 3. Legend
    const legend = document.getElementById('map-legend');
    if (hasDonut && lastInnerRing) legend.classList.remove('hidden');
    else legend.classList.add('hidden');

    // 4. Fetch places
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

    // Filter out inner ring (donut)
    if (hasDonut && lastInnerRing) {
      allResults = allResults.filter(item => !pointInPolygon(item.lon, item.lat, lastInnerRing));
    }

    const modeLabel  = usedFallback ? t('approxCircle') : `${t('roadNetwork')} · ${transportLabel(selectedTransport)}`;
    const minLabel   = hasDonut ? `${t('from')} ${formatTravelTime(minMin)} ` : '';
    document.getElementById('radius-info').textContent =
      `${minLabel}${t('to')} ${formatTravelTime(maxMin)} · ${modeLabel}`;
    document.getElementById('results-header').classList.remove('hidden');

    // Show fav btn if there are favorites
    syncFavBtn();

    // Share btn always visible after search
    document.getElementById('share-btn').classList.remove('hidden');

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
  const maxPoints = minutes > 480 ? 50 : minutes > 180 ? 60 : 80;
  const step = Math.max(1, Math.floor(ring.length / maxPoints));
  return ring.filter((_, i) => i % step === 0)
    .map(([lon, lat]) => `${lat.toFixed(5)} ${lon.toFixed(5)}`).join(' ');
}

function drawSingleIsochrone(ring) {
  isoLayer.clearLayers();
  const latlngs = ring.map(([lon, lat]) => [lat, lon]);
  L.polygon(latlngs, {
    color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.07, weight: 2.5, dashArray: '7 4',
  }).addTo(isoLayer);
  addUserMarker();
  try { map.fitBounds(L.latLngBounds(latlngs), { padding: [30, 30] }); } catch {}
}

function drawDonut(outerRing, innerRing) {
  isoLayer.clearLayers();
  const outer = outerRing.map(([lon, lat]) => [lat, lon]);
  const inner = innerRing.map(([lon, lat]) => [lat, lon]);
  L.polygon([outer, inner], {
    color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.07, weight: 2.5, dashArray: '7 4',
  }).addTo(isoLayer);
  L.polyline(inner, { color: '#2563eb', weight: 2, dashArray: '5 5', opacity: 0.7 }).addTo(isoLayer);
  addUserMarker();
  try { map.fitBounds(L.latLngBounds(outer), { padding: [30, 30] }); } catch {}
}

function drawCircleFallback(loc, radiusM) {
  isoLayer.clearLayers();
  L.circle([loc.lat, loc.lon], {
    radius: radiusM, color: '#2563eb', fillColor: '#2563eb',
    fillOpacity: 0.07, weight: 2, dashArray: '7 4',
  }).addTo(isoLayer);
  addUserMarker();
}

function addUserMarker() {
  L.circleMarker([userLocation.lat, userLocation.lon], {
    radius: 9, color: '#fff', fillColor: '#2563eb', fillOpacity: 1, weight: 3,
  }).bindPopup(`<b>${t('myLocation')}</b>`).addTo(isoLayer);
}

// ── Point in polygon (ray casting) ────────────────────────
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
  const timeout = isLarge ? 120 : 30;
  const lines   = catInfo.queries.map(q => `  ${q}${filter};`).join('\n');
  const query   = `[out:json][timeout:${timeout}];\n(\n${lines}\n);\nout center tags;`;

  const res  = await fetch(OVERPASS, { method: 'POST', body: query });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const data = await res.json();
  return (data.elements || []).map(el => ({ ...el, _cat: cat }));
}

// ── Overpass: overnight ────────────────────────────────────
async function fetchOvernightPlaces(accType, polyStr, loc, radiusM, isLarge) {
  const typeInfo = ACC_TYPE_MAP[accType];
  const filter   = buildFilter(polyStr, loc, radiusM);
  const timeout  = isLarge ? 120 : 60;
  const lines    = typeInfo.osmQueries.map(q => `  ${q}${filter};`).join('\n');
  const query    = `[out:json][timeout:${timeout}];\n(\n${lines}\n);\nout center tags;`;

  const res  = await fetch(OVERPASS, { method: 'POST', body: query });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const data = await res.json();
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
    const tags    = el.tags || {};
    const cat     = el._cat;
    const catInfo = CATEGORY_MAP[cat];
    const catLabel = (t('catLabels') || {})[cat] || cat;
    return {
      id: el.id, type: el.type, cat,
      catInfo: { ...catInfo, label: catLabel },
      name: tags.name || tags['name:nl'] || `(${catLabel})`,
      lat, lon,
      dist:     haversineKm(loc.lat, loc.lon, lat, lon),
      tags,
      openStat: getOpenStatus(tags),
      rating:   parseRating(tags),
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
    const name      = tags.name || tags['name:nl'] || `(${accLabel})`;
    const stars     = parseFloat(tags.stars) || null;
    const capacity  = parseInt(tags.capacity) || parseInt(tags['capacity:persons']) || null;
    const amenLabels = t('amenityLabels') || {};
    const amenIcons = typeInfo.amenityIcons
      .filter(a => a.checkFn(tags))
      .map(a => ({ icon: a.icon, label: amenLabels[a.labelKey] || a.labelKey }));
    return {
      id: el.id, type: el.type, cat: accType,
      catInfo: { label: accLabel, icon: typeInfo.icon, color: typeInfo.color },
      name, lat, lon,
      dist:     haversineKm(loc.lat, loc.lon, lat, lon),
      tags, stars, capacity, amenIcons,
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

  const count = items.length;
  const locWord = count === 1 ? t('locations') : t('locationsPlural');
  document.getElementById('results-count').textContent = `${count} ${locWord}`;

  if (!count) {
    list.innerHTML = `<li style="text-align:center;color:var(--text-muted);padding:24px;font-size:13px;">${t('noResults')}</li>`;
    return;
  }

  const cap = 100;
  items.slice(0, cap).forEach((item, idx) => {
    const marker = L.marker([item.lat, item.lon], { icon: makeIcon(item.catInfo.color) })
      .bindPopup(makePopupHtml(item)).addTo(markersLayer);
    marker.on('click', () => highlightItem(item.id));

    const li         = document.createElement('li');
    li.className     = 'result-item';
    li.dataset.id    = item.id;
    li.style.cssText = `--item-color:${item.catInfo.color};animation-delay:${Math.min(idx * 12, 240)}ms`;
    li.innerHTML     = currentMode === 'overnight'
      ? buildOvernightCardHTML(item)
      : buildActivityCardHTML(item);

    li.addEventListener('click', () => {
      map.setView([item.lat, item.lon], 15);
      marker.openPopup();
      highlightItem(item.id);
      showDetailModal(item);
    });
    list.appendChild(li);
  });

  if (items.length > cap) {
    const note = document.createElement('li');
    note.style.cssText = 'text-align:center;color:var(--text-muted);font-size:11px;padding:8px;';
    note.textContent   = t('moreResults').replace('{n}', items.length - cap);
    list.appendChild(note);
  }
}

function buildActivityCardHTML(item) {
  const isFav = favorites.has(String(item.id));
  return `
    <div class="result-top">
      <span class="result-dot" style="background:${item.catInfo.color}"></span>
      <span class="result-name">${escHtml(item.name)}</span>
      <button class="fav-btn${isFav ? ' active' : ''}" data-id="${item.id}" title="Favoriet">♥</button>
    </div>
    <div class="result-meta">
      <span class="result-type" style="border-color:${item.catInfo.color}40;color:${item.catInfo.color};background:${hexAlpha(item.catInfo.color,.08)}">${item.catInfo.icon} ${item.catInfo.label}</span>
      <span class="result-dist">📍 ${formatDist(item.dist)}</span>
      ${openBadge(item.openStat)}
      ${item.rating ? `<span class="result-rating">⭐ ${item.rating}</span>` : ''}
    </div>`;
}

function buildOvernightCardHTML(item) {
  const starsHtml = item.stars
    ? `<span class="result-stars">${'⭐'.repeat(Math.min(item.stars, 5))}</span>` : '';
  const amenHtml  = item.amenIcons.length
    ? `<div class="result-amenities">${item.amenIcons.map(a => `<span title="${escHtml(a.label)}">${a.icon}</span>`).join('')}</div>` : '';
  const isFav = favorites.has(String(item.id));
  return `
    <div class="result-top">
      <span class="result-dot" style="background:${item.catInfo.color}"></span>
      <span class="result-name">${escHtml(item.name)}</span>
      <button class="fav-btn${isFav ? ' active' : ''}" data-id="${item.id}" title="Favoriet">♥</button>
    </div>
    <div class="result-meta">
      <span class="result-type" style="border-color:${item.catInfo.color}40;color:${item.catInfo.color};background:${hexAlpha(item.catInfo.color,.08)}">${item.catInfo.icon} ${item.catInfo.label}</span>
      <span class="result-dist">📍 ${formatDist(item.dist)}</span>
      ${starsHtml}
      ${item.capacity ? `<span class="result-dist">👥 ${item.capacity}</span>` : ''}
    </div>
    ${amenHtml}`;
}

// Fav button clicks (delegated)
document.addEventListener('click', e => {
  const btn = e.target.closest('.fav-btn');
  if (!btn) return;
  e.stopPropagation();
  const id = String(btn.dataset.id);
  if (favorites.has(id)) { favorites.delete(id); showToast(t('favRemoved')); }
  else { favorites.add(id); showToast(t('favAdded')); }
  saveFavorites();
  btn.classList.toggle('active', favorites.has(id));
  syncFavBtn();
});

// ── Favorites ──────────────────────────────────────────────
function loadFavorites() {
  try { return new Set(JSON.parse(localStorage.getItem('lz_favorites') || '[]')); }
  catch { return new Set(); }
}

function saveFavorites() {
  localStorage.setItem('lz_favorites', JSON.stringify([...favorites]));
}

function syncFavBtn() {
  const btn = document.getElementById('fav-filter-btn');
  const hasFavs = allResults.some(r => favorites.has(String(r.id)));
  btn.classList.toggle('hidden', !hasFavs);
}

// ── Share URL ──────────────────────────────────────────────
function saveToHash() {
  if (!userLocation) return;
  const params = new URLSearchParams({
    lat:  userLocation.lat.toFixed(5),
    lon:  userLocation.lon.toFixed(5),
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
      document.getElementById('location-input').value = `${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}`;
      map.setView([userLocation.lat, userLocation.lon], 11);
    }
    if (p.get('lang') && ['nl','en'].includes(p.get('lang'))) {
      lang = p.get('lang');
      document.getElementById('lang-select').value = lang;
      applyTranslations();
    }
    if (p.get('mode')) switchMode(p.get('mode'));
    if (p.get('transport')) {
      selectedTransport = p.get('transport');
      document.querySelectorAll('.transport-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === selectedTransport));
    }
    if (p.get('tmin')) document.getElementById('time-min').value = p.get('tmin');
    if (p.get('tmax')) document.getElementById('time-max').value = p.get('tmax');
    updateRangeDisplay(); updateRangeFill();
    if (p.get('cats')) {
      selectedCats = new Set(p.get('cats').split(',').filter(c => CATEGORY_MAP[c]));
      syncCatButtons();
    }
    if (p.get('acc') && ACC_TYPE_MAP[p.get('acc')]) {
      selectedAccType = p.get('acc');
      document.querySelectorAll('.acc-type-btn').forEach(b => b.classList.toggle('active', b.dataset.type === selectedAccType));
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

// ── Category chips ─────────────────────────────────────────
function syncCatButtons() {
  document.querySelectorAll('.cat-btn').forEach(btn => {
    const cat    = btn.dataset.cat;
    const ci     = CATEGORY_MAP[cat];
    const active = selectedCats.has(cat);
    btn.classList.toggle('active', active);
    if (active) {
      btn.style.borderColor = ci.color;
      btn.style.color       = ci.color;
      btn.style.background  = hexAlpha(ci.color, 0.1);
    } else {
      btn.style.borderColor = btn.style.color = btn.style.background = '';
    }
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
    const ci     = CATEGORY_MAP[cat];
    const label  = (t('catLabels') || {})[cat] || cat;
    const active = visibleCats.has(cat);
    return `<button class="cat-chip ${active ? 'active' : ''}" data-cat="${cat}" style="--chip-color:${ci.color}">
      ${ci.icon} ${label}<span class="chip-count">${counts[cat] || 0}</span>
    </button>`;
  }).join('');
}

// ── Highlight ──────────────────────────────────────────────
function highlightItem(id) {
  document.querySelectorAll('.result-item').forEach(el =>
    el.classList.toggle('highlighted', el.dataset.id == id));
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

  let html = `
    <div class="modal-name">${escHtml(item.name)}</div>
    <div class="modal-badges">
      <span class="badge" style="background:${hexAlpha(item.catInfo.color,.12)};color:${item.catInfo.color}">${item.catInfo.icon} ${item.catInfo.label}</span>
      ${openBadgeFull(item.openStat)}
      ${item.stars ? `<span class="badge" style="background:#fef9c3;color:#854d0e">${'⭐'.repeat(Math.min(item.stars,5))} ${item.stars} ${t('stars')}</span>` : ''}
      <button class="modal-fav-btn${isFav ? ' active' : ''}" data-id="${item.id}">♥ ${t('favorites')}</button>
    </div>
    <div class="modal-details">
      <div class="modal-row"><span class="micon">📍</span><span class="mtext">${formatDist(item.dist)} ${t('fromLocation')}</span></div>
      ${address ? `<div class="modal-row"><span class="micon">🏠</span><span class="mtext">${escHtml(address)}</span></div>` : ''}
      ${hours   ? `<div class="modal-row"><span class="micon">🕐</span><span class="mtext">${escHtml(hours)}</span></div>` : ''}
      ${phone   ? `<div class="modal-row"><span class="micon">📞</span><span class="mtext"><a href="tel:${escHtml(phone)}">${escHtml(phone)}</a></span></div>` : ''}
      ${website ? `<div class="modal-row"><span class="micon">🌐</span><span class="mtext"><a href="${escHtml(website)}" target="_blank" rel="noopener noreferrer">${escHtml(website)}</a></span></div>` : ''}
      ${item.rating   ? `<div class="modal-row"><span class="micon">⭐</span><span class="mtext">${t('rating')}: ${item.rating}</span></div>` : ''}
      ${item.capacity ? `<div class="modal-row"><span class="micon">👥</span><span class="mtext">${t('capacity')}: ${item.capacity} ${t('persons')}</span></div>` : ''}
    </div>`;

  if (currentMode === 'overnight' && item.amenIcons?.length) {
    html += `<div class="modal-amenity-grid">
      ${item.amenIcons.map(a => `<span class="modal-amenity-pill">${a.icon} ${a.label}</span>`).join('')}
    </div>`;
  }

  if (currentMode === 'overnight') {
    html += buildBookingLinks(item);
  } else {
    const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lon}`;
    const amaps = `https://maps.apple.com/?daddr=${item.lat},${item.lon}`;
    html += `<div class="modal-nav-btns">
      <a class="nav-btn nav-gmaps" href="${gmaps}" target="_blank" rel="noopener noreferrer">🗺️ Google Maps</a>
      <a class="nav-btn nav-amaps" href="${amaps}" target="_blank" rel="noopener noreferrer">🍎 Apple Maps</a>
    </div>`;
  }

  html += `<div class="osm-link"><a href="${osmUrl}" target="_blank" rel="noopener noreferrer">${t('viewOnOSM')}</a></div>`;

  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('detail-modal').classList.remove('hidden');

  // Modal fav button
  document.querySelector('.modal-fav-btn')?.addEventListener('click', function() {
    const id = String(this.dataset.id);
    if (favorites.has(id)) { favorites.delete(id); showToast(t('favRemoved')); }
    else { favorites.add(id); showToast(t('favAdded')); }
    saveFavorites();
    this.classList.toggle('active', favorites.has(id));
    syncFavBtn();
    // Also update list card
    const listBtn = document.querySelector(`.fav-btn[data-id="${id}"]`);
    if (listBtn) listBtn.classList.toggle('active', favorites.has(id));
  });
}

function buildBookingLinks(item) {
  const lat  = item.lat.toFixed(5);
  const lon  = item.lon.toFixed(5);
  const gmapsSearch = term =>
    `https://www.google.com/maps/search/${encodeURIComponent(term)}/@${lat},${lon},13z`;

  let buttons = '';
  if (item.accType === 'camping') {
    buttons = `
      <a class="book-btn book-booking" href="https://www.booking.com/searchresults.html?latitude=${lat}&longitude=${lon}" target="_blank" rel="noopener noreferrer">📅 Booking.com</a>
      <a class="book-btn book-anwb"    href="https://www.anwb.nl/campings" target="_blank" rel="noopener noreferrer">🏕️ ANWB Camping</a>
      <a class="book-btn book-gmaps"   href="${gmapsSearch('camping')}" target="_blank" rel="noopener noreferrer">🗺️ Google Maps</a>`;
  } else if (item.accType === 'hotel') {
    buttons = `
      <a class="book-btn book-booking" href="https://www.booking.com/searchresults.html?latitude=${lat}&longitude=${lon}" target="_blank" rel="noopener noreferrer">📅 Booking.com</a>
      <a class="book-btn book-gmaps"   href="${gmapsSearch('hotel')}" target="_blank" rel="noopener noreferrer">🗺️ Hotels omgeving</a>`;
  } else {
    buttons = `
      <a class="book-btn book-airbnb"  href="https://www.airbnb.nl/s/homes?ne_lat=${(item.lat+0.3).toFixed(4)}&ne_lng=${(item.lon+0.4).toFixed(4)}&sw_lat=${(item.lat-0.3).toFixed(4)}&sw_lng=${(item.lon-0.4).toFixed(4)}" target="_blank" rel="noopener noreferrer">🏡 Airbnb</a>
      <a class="book-btn book-booking" href="https://www.booking.com/searchresults.html?latitude=${lat}&longitude=${lon}" target="_blank" rel="noopener noreferrer">📅 Booking.com</a>`;
  }
  return `<div class="modal-booking-section">
    <div class="modal-booking-label">${t('searchBookNearby')}</div>
    <div class="book-btns">${buttons}</div>
  </div>`;
}

function closeModal() { document.getElementById('detail-modal').classList.add('hidden'); }

// ── Helpers ────────────────────────────────────────────────
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371, dLat = toRad(lat2-lat1), dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

const toRad           = d  => d * Math.PI / 180;
const formatDist      = km => km < 1 ? `${Math.round(km*1000)} m` : `${km.toFixed(1)} km`;
const minutesToMeters = (min, mode) => Math.ceil((SPEEDS[mode] * min / 60) * 1000);
const transportLabel  = mode => ({ driving: 'auto', cycling: 'fiets', walking: 'lopen' })[mode] ?? mode;

function formatTravelTime(minutes) {
  if (minutes === 0) return `0 ${t('min')}`;
  if (minutes < 60)  return `${minutes} ${t('min')}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} ${t('hour')}`;
  return `${h}u ${m}m`;
}

function hexAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
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

function openBadge(status) {
  if (status === 'open')   return `<span class="result-open open">● ${t('openStatus')}</span>`;
  if (status === 'closed') return `<span class="result-open closed">● ${t('closedStatus')}</span>`;
  return '';
}

function openBadgeFull(status) {
  if (status === 'open')   return `<span class="badge" style="background:#dcfce7;color:#15803d">● ${t('openStatus')}</span>`;
  if (status === 'closed') return `<span class="badge" style="background:#fee2e2;color:#b91c1c">● ${t('closedStatus')}</span>`;
  return `<span class="badge" style="background:#f1f5f9;color:#64748b">${t('unknownHours')}</span>`;
}

function makePopupHtml(item) {
  return `
    <div class="popup-name">${escHtml(item.name)}</div>
    <div style="color:${item.catInfo.color};font-size:12px">${item.catInfo.icon} ${item.catInfo.label}</div>
    <div style="font-size:11px;color:#64748b;margin-top:3px">📍 ${formatDist(item.dist)}</div>
    ${item.stars ? `<div style="font-size:12px">${'⭐'.repeat(Math.min(item.stars,5))}</div>` : ''}
    ${item.openStat !== 'unknown' ? `<div style="font-size:11px;font-weight:700;margin-top:2px;color:${item.openStat==='open'?'#15803d':'#b91c1c'}">● ${item.openStat==='open'?t('openStatus'):t('closedStatus')}</div>` : ''}`;
}

function makeIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);transform:rotate(-45deg)"></div>`,
    iconSize: [26,26], iconAnchor: [13,26], popupAnchor: [0,-28],
  });
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function setSearching(on) {
  const btn = document.getElementById('search-btn');
  btn.classList.toggle('loading', on);
  btn.innerHTML = on
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> ${t('searching')}`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> <span data-i18n="search">${t('search')}</span>`;
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
