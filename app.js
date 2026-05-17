'use strict';

// ── External APIs ──────────────────────────────────────────
const VALHALLA = 'https://valhalla1.openstreetmap.de/isochrone';
const OVERPASS = 'https://overpass-api.de/api/interpreter';
const COSTING  = { driving: 'auto', cycling: 'bicycle', walking: 'pedestrian' };
const SPEEDS   = { driving: 40, cycling: 15, walking: 5 };

// ── Activity categories ────────────────────────────────────
const CATEGORY_MAP = {
  cafe:        { label: 'Koffie',      icon: '☕', color: '#d97706', queries: ['node[amenity=cafe]',        'way[amenity=cafe]'] },
  restaurant:  { label: 'Restaurant',  icon: '🍽️', color: '#dc2626', queries: ['node[amenity=restaurant]',  'way[amenity=restaurant]'] },
  bar:         { label: 'Bar',         icon: '🍺', color: '#7c3aed', queries: ['node[amenity=bar]',         'way[amenity=bar]'] },
  museum:      { label: 'Museum',      icon: '🏛️', color: '#0891b2', queries: ['node[tourism=museum]',      'way[tourism=museum]'] },
  park:        { label: 'Park',        icon: '🌳', color: '#16a34a', queries: ['node[leisure=park]',        'way[leisure=park]'] },
  hiking:      { label: 'Wandelen',    icon: '🥾', color: '#65a30d', queries: ['relation[route=hiking]',   'node[leisure=nature_reserve]', 'way[leisure=nature_reserve]'] },
  supermarket: { label: 'Supermarkt',  icon: '🛒', color: '#ea580c', queries: ['node[shop=supermarket]',   'way[shop=supermarket]'] },
  library:     { label: 'Bibliotheek', icon: '📚', color: '#4f46e5', queries: ['node[amenity=library]',    'way[amenity=library]'] },
  cinema:      { label: 'Bioscoop',    icon: '🎬', color: '#db2777', queries: ['node[amenity=cinema]',     'way[amenity=cinema]'] },
  bakery:      { label: 'Bakkerij',    icon: '🥐', color: '#b45309', queries: ['node[shop=bakery]',        'way[shop=bakery]'] },
  fast_food:   { label: 'Fastfood',    icon: '🍔', color: '#e11d48', queries: ['node[amenity=fast_food]',  'way[amenity=fast_food]'] },
  playground:  { label: 'Speeltuin',   icon: '🛝', color: '#059669', queries: ['node[leisure=playground]', 'way[leisure=playground]'] },
};

// ── Accommodation types ────────────────────────────────────
const ACC_TYPE_MAP = {
  camping: {
    label: 'Camping', icon: '⛺', color: '#16a34a',
    osmQueries: ['node[tourism=camp_site]', 'way[tourism=camp_site]'],
    bookingType: 'camping',
    filters: [
      { id: 'tents',    label: '⛺ Tent',       checkFn: t => t.tents === 'yes' },
      { id: 'camper',   label: '🚐 Camper',     checkFn: t => t.motorhome === 'yes' },
      { id: 'caravan',  label: '🚗 Caravan',    checkFn: t => t.caravans === 'yes' },
      { id: 'electric', label: '🔌 Elektra',    checkFn: t => t.electric_hook_up === 'yes' || t.electricity === 'yes' },
      { id: 'dogs',     label: '🐕 Honden',     checkFn: t => t.dogs === 'yes' },
      { id: 'pool',     label: '🏊 Zwembad',    checkFn: t => t.swimming_pool === 'yes' },
      { id: 'wifi',     label: '📶 WiFi',       checkFn: t => ['wlan','yes'].includes(t.internet_access) },
      { id: 'shower',   label: '🚿 Douches',    checkFn: t => t.shower === 'yes' },
      { id: 'shop',     label: '🛒 Winkel',     checkFn: t => t.shop === 'yes' || t.supermarket === 'yes' },
      { id: 'bbq',      label: '🔥 BBQ',        checkFn: t => t.bbq === 'yes' },
    ],
    amenityIcons: [
      { icon: '⛺', checkFn: t => t.tents === 'yes',       label: 'Tent' },
      { icon: '🚐', checkFn: t => t.motorhome === 'yes',   label: 'Camper' },
      { icon: '🚗', checkFn: t => t.caravans === 'yes',    label: 'Caravan' },
      { icon: '🔌', checkFn: t => t.electric_hook_up === 'yes' || t.electricity === 'yes', label: 'Elektra' },
      { icon: '🐕', checkFn: t => t.dogs === 'yes',        label: 'Honden' },
      { icon: '🏊', checkFn: t => t.swimming_pool === 'yes', label: 'Zwembad' },
      { icon: '📶', checkFn: t => ['wlan','yes'].includes(t.internet_access), label: 'WiFi' },
      { icon: '🚿', checkFn: t => t.shower === 'yes',      label: 'Douches' },
      { icon: '🔥', checkFn: t => t.bbq === 'yes',         label: 'BBQ' },
    ],
  },
  hotel: {
    label: 'Hotel / B&B', icon: '🏨', color: '#2563eb',
    osmQueries: [
      'node[tourism=hotel]',  'way[tourism=hotel]',
      'node[tourism=hostel]', 'way[tourism=hostel]',
      'node[tourism=guest_house]', 'way[tourism=guest_house]',
      'node[tourism=motel]',  'way[tourism=motel]',
    ],
    bookingType: 'hotel',
    hasStars: true,
    filters: [
      { id: 'dogs',       label: '🐕 Honden',     checkFn: t => t.dogs === 'yes' },
      { id: 'pool',       label: '🏊 Zwembad',    checkFn: t => t.swimming_pool === 'yes' },
      { id: 'parking',    label: '🅿️ Parkeren',   checkFn: t => ['yes','public','private','free'].includes(t.parking) },
      { id: 'wifi',       label: '📶 WiFi',       checkFn: t => ['wlan','yes'].includes(t.internet_access) },
      { id: 'restaurant', label: '🍽️ Restaurant', checkFn: t => t.restaurant === 'yes' },
      { id: 'bar',        label: '🍺 Bar',        checkFn: t => t.bar === 'yes' },
      { id: 'spa',        label: '💆 Spa/sauna',  checkFn: t => t.spa === 'yes' || t.sauna === 'yes' },
    ],
    amenityIcons: [
      { icon: '🐕', checkFn: t => t.dogs === 'yes',        label: 'Honden' },
      { icon: '🏊', checkFn: t => t.swimming_pool === 'yes', label: 'Zwembad' },
      { icon: '🅿️', checkFn: t => ['yes','public','private','free'].includes(t.parking), label: 'Parkeren' },
      { icon: '📶', checkFn: t => ['wlan','yes'].includes(t.internet_access), label: 'WiFi' },
      { icon: '🍽️', checkFn: t => t.restaurant === 'yes', label: 'Restaurant' },
      { icon: '🍺', checkFn: t => t.bar === 'yes',         label: 'Bar' },
      { icon: '💆', checkFn: t => t.spa === 'yes' || t.sauna === 'yes', label: 'Spa' },
    ],
  },
  vakantiewoning: {
    label: 'Vakantiehuis', icon: '🏠', color: '#7c3aed',
    osmQueries: [
      'node[tourism=apartment]',       'way[tourism=apartment]',
      'node[tourism=chalet]',          'way[tourism=chalet]',
      'node[tourism=holiday_village]', 'way[tourism=holiday_village]',
      'node[tourism=alpine_hut]',      'way[tourism=alpine_hut]',
    ],
    bookingType: 'vakantiewoning',
    hasPersons: true,
    filters: [
      { id: 'dogs',   label: '🐕 Honden',    checkFn: t => t.dogs === 'yes' },
      { id: 'pool',   label: '🏊 Zwembad',   checkFn: t => t.swimming_pool === 'yes' },
      { id: 'garden', label: '🌿 Tuin',      checkFn: t => t.garden === 'yes' },
      { id: 'wifi',   label: '📶 WiFi',      checkFn: t => ['wlan','yes'].includes(t.internet_access) },
      { id: 'bbq',    label: '🔥 BBQ',       checkFn: t => t.bbq === 'yes' },
    ],
    amenityIcons: [
      { icon: '🐕', checkFn: t => t.dogs === 'yes',        label: 'Honden' },
      { icon: '🏊', checkFn: t => t.swimming_pool === 'yes', label: 'Zwembad' },
      { icon: '🌿', checkFn: t => t.garden === 'yes',       label: 'Tuin' },
      { icon: '📶', checkFn: t => ['wlan','yes'].includes(t.internet_access), label: 'WiFi' },
      { icon: '🔥', checkFn: t => t.bbq === 'yes',          label: 'BBQ' },
    ],
  },
};

// ── State ──────────────────────────────────────────────────
let map, isoLayer, markersLayer;
let userLocation     = null;
let currentMode      = 'activity';
// Activity
let selectedCats     = new Set(['cafe']);
let visibleCats      = new Set();
// Overnight
let selectedAccType  = 'camping';
let activeAccFilters = new Set();
let minStars         = 0;
let minPersons       = 0;
// Shared
let selectedTransport = 'driving';
let allResults        = [];
let openNow           = false;
let currentSort       = 'distance';
let acTimer           = null;

// ── Map ────────────────────────────────────────────────────
function initMap() {
  map = L.map('map').setView([52.3, 5.3], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);
  isoLayer     = L.layerGroup().addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

// ── UI wiring ──────────────────────────────────────────────
function initUI() {
  // Mode tabs
  document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });

  // GPS
  document.getElementById('gps-btn').addEventListener('click', getGPS);

  // Time slider
  const slider  = document.getElementById('time-slider');
  slider.addEventListener('input', () => {
    document.getElementById('time-display').textContent = formatTravelTime(parseInt(slider.value));
  });

  // Transport
  document.querySelectorAll('.transport-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.transport-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTransport = btn.dataset.mode;
    });
  });

  // Activity categories (multi-select)
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      if (selectedCats.has(cat)) { if (selectedCats.size === 1) return; selectedCats.delete(cat); }
      else selectedCats.add(cat);
      syncCatButtons();
    });
  });
  syncCatButtons();

  // Accommodation type (single select)
  document.querySelectorAll('.acc-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.acc-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedAccType = btn.dataset.type;
      activeAccFilters.clear();
      minStars = 0; minPersons = 0;
      renderAccFilters();
    });
  });

  // Star filter
  document.getElementById('star-btns').addEventListener('click', e => {
    const btn = e.target.closest('.filter-opt-btn');
    if (!btn) return;
    document.querySelectorAll('#star-btns .filter-opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    minStars = parseInt(btn.dataset.value);
    if (allResults.length && currentMode === 'overnight') renderList();
  });

  // Persons filter
  document.getElementById('persons-btns').addEventListener('click', e => {
    const btn = e.target.closest('.filter-opt-btn');
    if (!btn) return;
    document.querySelectorAll('#persons-btns .filter-opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    minPersons = parseInt(btn.dataset.value);
    if (allResults.length && currentMode === 'overnight') renderList();
  });

  // Amenity chips (delegated)
  document.getElementById('acc-amenity-chips').addEventListener('click', e => {
    const chip = e.target.closest('.amenity-chip');
    if (!chip) return;
    const id = chip.dataset.id;
    if (activeAccFilters.has(id)) activeAccFilters.delete(id);
    else activeAccFilters.add(id);
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

  // Search
  document.getElementById('search-btn').addEventListener('click', doSearch);

  // Surprise
  document.getElementById('surprise-btn').addEventListener('click', surpriseMe);

  // Location autocomplete
  const input = document.getElementById('location-input');
  input.addEventListener('input', () => {
    clearTimeout(acTimer);
    const q = input.value.trim();
    if (q.length < 3) { hideAC(); return; }
    acTimer = setTimeout(() => fetchAC(q), 350);
  });
  input.addEventListener('keydown', e => { if (e.key === 'Escape') hideAC(); });
  document.addEventListener('click', e => { if (!e.target.closest('.autocomplete-wrapper')) hideAC(); });

  // Cat filter chips (post-search)
  document.getElementById('cat-filter-bar').addEventListener('click', e => {
    const chip = e.target.closest('.cat-chip');
    if (!chip) return;
    const cat = chip.dataset.cat;
    if (visibleCats.has(cat)) { if (visibleCats.size === 1) return; visibleCats.delete(cat); }
    else visibleCats.add(cat);
    syncCatChips();
    renderList();
  });

  // Modal
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('detail-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('detail-modal')) closeModal();
  });

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

  // Time slider range
  const slider = document.getElementById('time-slider');
  if (isOvernight) {
    slider.min = 30; slider.max = 720; slider.step = 30; slider.value = 120;
    document.getElementById('ticks-activity').classList.add('hidden');
    document.getElementById('ticks-overnight').classList.remove('hidden');
  } else {
    slider.min = 5; slider.max = 60; slider.step = 5; slider.value = 15;
    document.getElementById('ticks-activity').classList.remove('hidden');
    document.getElementById('ticks-overnight').classList.add('hidden');
  }
  document.getElementById('time-display').textContent = formatTravelTime(parseInt(slider.value));

  // Sort options
  const sortSel = document.getElementById('sort-select');
  const starsOpt = sortSel.querySelector('option[value="stars"]');
  if (isOvernight && !starsOpt) {
    const opt = document.createElement('option');
    opt.value = 'stars'; opt.textContent = '⭐ Sterren';
    sortSel.appendChild(opt);
  } else if (isActivity && starsOpt) {
    sortSel.removeChild(starsOpt);
  }
  sortSel.value = 'distance'; currentSort = 'distance';

  // Clear results
  allResults = [];
  markersLayer.clearLayers();
  isoLayer.clearLayers();
  document.getElementById('results-header').classList.add('hidden');
  document.getElementById('results-list').innerHTML = '';
  document.getElementById('cat-filter-section').classList.add('hidden');
}

// ── Accommodation filters ──────────────────────────────────
function renderAccFilters() {
  const typeInfo  = ACC_TYPE_MAP[selectedAccType];
  const chipCont  = document.getElementById('acc-amenity-chips');
  const starSec   = document.getElementById('star-filter-section');
  const personsSec = document.getElementById('persons-filter-section');

  chipCont.innerHTML = typeInfo.filters.map(f => `
    <button class="amenity-chip${activeAccFilters.has(f.id) ? ' active' : ''}" data-id="${f.id}">${f.label}</button>
  `).join('');

  starSec.classList.toggle('hidden', !typeInfo.hasStars);
  personsSec.classList.toggle('hidden', !typeInfo.hasPersons);

  // Reset sub-filter buttons
  document.querySelectorAll('#star-btns .filter-opt-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  document.querySelectorAll('#persons-btns .filter-opt-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  minStars = 0; minPersons = 0;
}

// ── GPS ────────────────────────────────────────────────────
function getGPS() {
  if (!navigator.geolocation) { showToast('GPS niet beschikbaar.'); return; }
  const btn = document.getElementById('gps-btn');
  btn.classList.add('loading');
  navigator.geolocation.getCurrentPosition(
    pos => {
      btn.classList.remove('loading');
      setUserLocation(pos.coords.latitude, pos.coords.longitude, 'Mijn GPS-locatie');
      showToast('GPS-locatie gevonden!');
    },
    () => { btn.classList.remove('loading'); showToast('GPS mislukt. Typ een adres in.'); },
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
    const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}&accept-language=nl`);
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
  const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`);
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), label: data[0].display_name };
}

// ── Main search ────────────────────────────────────────────
async function doSearch() {
  if (!userLocation) {
    const q = document.getElementById('location-input').value.trim();
    if (!q) { showToast('Voer een locatie in of gebruik GPS.'); return; }
    showToast('Locatie zoeken…');
    try {
      const r = await geocode(q);
      if (!r) { showToast('Locatie niet gevonden.'); return; }
      setUserLocation(r.lat, r.lon, r.label);
    } catch { showToast('Kon de locatie niet opzoeken.'); return; }
  }

  const minutes = parseInt(document.getElementById('time-slider').value);
  setSearching(true);

  try {
    // 1. Isochrone
    let polyStr      = null;
    let bbox         = null;
    let usedFallback = false;
    const isLargeArea = minutes > 180; // > 3 hours

    try {
      const iso = await fetchIsochrone(userLocation, minutes, selectedTransport, isLargeArea);
      drawIsochrone(iso);
      if (isLargeArea) {
        bbox = isochroneToBbox(iso);
      } else {
        polyStr = isoToOverpassPoly(iso);
      }
    } catch (err) {
      console.warn('Valhalla fallback:', err.message);
      usedFallback = true;
      drawCircleFallback(userLocation, minutesToMeters(minutes, selectedTransport));
    }

    // 2. Fetch places
    const radiusM = usedFallback ? minutesToMeters(minutes, selectedTransport) : null;

    if (currentMode === 'activity') {
      const cats       = [...selectedCats];
      const rawResults = await Promise.all(
        cats.map(cat => fetchActivityPlaces(cat, polyStr, bbox, userLocation, radiusM))
      );
      allResults  = processActivityResults(rawResults.flat(), userLocation);
      visibleCats = new Set(cats);
      syncCatChips();
    } else {
      const raw  = await fetchOvernightPlaces(selectedAccType, polyStr, bbox, userLocation, radiusM, minutes);
      allResults = processOvernightResults(raw, userLocation, selectedAccType);
    }

    const modeLabel = usedFallback ? 'geschatte cirkel' : `wegennetwerk · ${transportLabel(selectedTransport)}`;
    document.getElementById('radius-info').textContent = `${formatTravelTime(minutes)} · ${modeLabel}`;
    document.getElementById('results-header').classList.remove('hidden');

    renderList();

  } catch (err) {
    console.error(err);
    showToast('Zoeken mislukt. Probeer het opnieuw.');
  } finally {
    setSearching(false);
  }
}

// ── Isochrone ──────────────────────────────────────────────
async function fetchIsochrone(loc, minutes, mode, isLarge) {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), isLarge ? 20000 : 14000);
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
        generalize: isLarge ? 300 : 80,
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

function isoToOverpassPoly(geojson) {
  const feature = geojson.features?.[0];
  if (!feature) throw new Error('No isochrone feature');
  const ring  = feature.geometry.type === 'Polygon'
    ? feature.geometry.coordinates[0]
    : feature.geometry.coordinates[0][0];
  const step  = Math.max(1, Math.floor(ring.length / 70));
  return ring.filter((_, i) => i % step === 0)
    .map(([lon, lat]) => `${lat.toFixed(5)} ${lon.toFixed(5)}`).join(' ');
}

function isochroneToBbox(geojson) {
  const bounds = L.geoJSON(geojson).getBounds();
  return { south: bounds.getSouth(), west: bounds.getWest(), north: bounds.getNorth(), east: bounds.getEast() };
}

function drawIsochrone(geojson) {
  isoLayer.clearLayers();
  L.geoJSON(geojson, {
    style: { color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.06, weight: 2.5, dashArray: '7 4' },
  }).addTo(isoLayer);
  addUserMarker();
  try { map.fitBounds(L.geoJSON(geojson).getBounds(), { padding: [30, 30] }); } catch {}
}

function drawCircleFallback(loc, radiusM) {
  isoLayer.clearLayers();
  L.circle([loc.lat, loc.lon], {
    radius: radiusM, color: '#2563eb', fillColor: '#2563eb',
    fillOpacity: 0.06, weight: 2, dashArray: '7 4',
  }).addTo(isoLayer);
  addUserMarker();
}

function addUserMarker() {
  L.circleMarker([userLocation.lat, userLocation.lon], {
    radius: 9, color: '#fff', fillColor: '#2563eb', fillOpacity: 1, weight: 3,
  }).bindPopup('<b>Mijn locatie</b>').addTo(isoLayer);
}

// ── Overpass: activity ─────────────────────────────────────
async function fetchActivityPlaces(cat, polyStr, bbox, loc, radiusM) {
  const catInfo = CATEGORY_MAP[cat];
  const filter  = buildFilter(polyStr, bbox, loc, radiusM);
  const lines   = catInfo.queries.map(q => `  ${q}${filter};`).join('\n');
  const query   = `[out:json][timeout:30];\n(\n${lines}\n);\nout center tags;`;

  const res  = await fetch(OVERPASS, { method: 'POST', body: query });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const data = await res.json();
  return (data.elements || []).map(el => ({ ...el, _cat: cat }));
}

// ── Overpass: overnight ────────────────────────────────────
async function fetchOvernightPlaces(accType, polyStr, bbox, loc, radiusM, minutes) {
  const typeInfo = ACC_TYPE_MAP[accType];
  const filter   = buildFilter(polyStr, bbox, loc, radiusM);
  const limit    = minutes > 240 ? 400 : 600;
  const lines    = typeInfo.osmQueries.map(q => `  ${q}${filter};`).join('\n');
  const query    = `[out:json][timeout:60];\n(\n${lines}\n);\nout center tags ${limit};`;

  const res  = await fetch(OVERPASS, { method: 'POST', body: query });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const data = await res.json();
  return data.elements || [];
}

function buildFilter(polyStr, bbox, loc, radiusM) {
  if (polyStr) return `(poly:"${polyStr}")`;
  if (bbox)    return `(${bbox.south.toFixed(5)},${bbox.west.toFixed(5)},${bbox.north.toFixed(5)},${bbox.east.toFixed(5)})`;
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
    return {
      id: el.id, type: el.type, cat, catInfo,
      name: tags.name || tags['name:nl'] || `(${catInfo.label})`,
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
  const typeInfo = ACC_TYPE_MAP[accType];
  const seen     = new Set();

  return elements.map(el => {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (!lat || !lon) return null;
    const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    if (seen.has(key)) return null;
    seen.add(key);

    const tags     = el.tags || {};
    const name     = tags.name || tags['name:nl'] || `(${typeInfo.label})`;
    const stars    = parseFloat(tags.stars) || null;
    const capacity = parseInt(tags.capacity) || parseInt(tags['capacity:persons']) || null;
    const amenIcons = typeInfo.amenityIcons
      .filter(a => a.checkFn(tags))
      .map(a => ({ icon: a.icon, label: a.label }));

    return {
      id: el.id, type: el.type, cat: accType,
      catInfo: { label: typeInfo.label, icon: typeInfo.icon, color: typeInfo.color },
      name, lat, lon,
      dist:     haversineKm(loc.lat, loc.lon, lat, lon),
      tags, stars, capacity, amenIcons,
      openStat: getOpenStatus(tags),
      rating:   parseRating(tags),
      accType,
    };
  }).filter(Boolean);
}

// ── Render: shared ─────────────────────────────────────────
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

  if (currentSort === 'distance')     items.sort((a, b) => a.dist - b.dist);
  else if (currentSort === 'rating')  items.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
  else if (currentSort === 'stars')   items.sort((a, b) => (b.stars  ?? -1) - (a.stars  ?? -1));
  else                                items.sort((a, b) => a.name.localeCompare(b.name, 'nl'));

  document.getElementById('results-count').textContent =
    `${items.length} locatie${items.length !== 1 ? 's' : ''}`;

  if (!items.length) {
    list.innerHTML = '<li style="text-align:center;color:var(--text-muted);padding:24px;font-size:13px;">Geen resultaten. Pas de filters aan of vergroot de reistijd.</li>';
    return;
  }

  const cap = 100;
  items.slice(0, cap).forEach((item, idx) => {
    const marker = L.marker([item.lat, item.lon], { icon: makeIcon(item.catInfo.color) })
      .bindPopup(makePopupHtml(item)).addTo(markersLayer);
    marker.on('click', () => highlightItem(item.id));

    const li          = document.createElement('li');
    li.className      = 'result-item';
    li.dataset.id     = item.id;
    li.style.cssText  = `--item-color:${item.catInfo.color};animation-delay:${Math.min(idx*12,240)}ms`;
    li.innerHTML      = currentMode === 'overnight'
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
    note.textContent   = `+ ${items.length - cap} meer — verklein de reistijd voor betere resultaten`;
    list.appendChild(note);
  }
}

function buildActivityCardHTML(item) {
  return `
    <div class="result-top">
      <span class="result-dot" style="background:${item.catInfo.color}"></span>
      <span class="result-name">${escHtml(item.name)}</span>
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
    ? `<span class="result-stars">${'⭐'.repeat(Math.min(item.stars, 5))}</span>`
    : '';
  const amenHtml  = item.amenIcons.length
    ? `<div class="result-amenities">${item.amenIcons.map(a => `<span title="${a.label}">${a.icon}</span>`).join('')}</div>`
    : '';
  return `
    <div class="result-top">
      <span class="result-dot" style="background:${item.catInfo.color}"></span>
      <span class="result-name">${escHtml(item.name)}</span>
    </div>
    <div class="result-meta">
      <span class="result-type" style="border-color:${item.catInfo.color}40;color:${item.catInfo.color};background:${hexAlpha(item.catInfo.color,.08)}">${item.catInfo.icon} ${item.catInfo.label}</span>
      <span class="result-dist">📍 ${formatDist(item.dist)}</span>
      ${starsHtml}
      ${item.capacity ? `<span class="result-dist">👥 ${item.capacity}</span>` : ''}
    </div>
    ${amenHtml}`;
}

// ── Overnight filters ──────────────────────────────────────
function applyOvernightFilters(items) {
  return items.filter(item => {
    // Amenity filters
    for (const id of activeAccFilters) {
      const def = ACC_TYPE_MAP[selectedAccType].filters.find(f => f.id === id);
      if (def && !def.checkFn(item.tags)) return false;
    }
    // Stars
    if (minStars > 0 && (!item.stars || item.stars < minStars)) return false;
    // Persons
    if (minPersons > 0) {
      const cap = item.capacity || 0;
      if (cap < minPersons) return false;
    }
    return true;
  });
}

// ── Category chips (post-search, activity) ─────────────────
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
    const active = visibleCats.has(cat);
    return `<button class="cat-chip ${active ? 'active' : ''}" data-cat="${cat}" style="--chip-color:${ci.color}">
      ${ci.icon} ${ci.label}<span class="chip-count">${counts[cat] || 0}</span>
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
  if (!pool.length) { showToast('Geen resultaten om van te verrassen!'); return; }
  const item = pool[Math.floor(Math.random() * pool.length)];
  map.setView([item.lat, item.lon], 15);
  highlightItem(item.id);
  showDetailModal(item);
}

// ── Detail modal ───────────────────────────────────────────
function showDetailModal(item) {
  const tags   = item.tags;
  const osmUrl = `https://www.openstreetmap.org/${item.type}/${item.id}`;
  const website = tags.website || tags['contact:website'];
  const phone   = tags.phone   || tags['contact:phone'];
  const address = buildAddress(tags);
  const hours   = tags.opening_hours;

  let html = `
    <div class="modal-name">${escHtml(item.name)}</div>
    <div class="modal-badges">
      <span class="badge" style="background:${hexAlpha(item.catInfo.color,.12)};color:${item.catInfo.color}">${item.catInfo.icon} ${item.catInfo.label}</span>
      ${openBadgeFull(item.openStat)}
      ${item.stars ? `<span class="badge" style="background:#fef9c3;color:#854d0e">${'⭐'.repeat(Math.min(item.stars,5))} ${item.stars} sterren</span>` : ''}
    </div>
    <div class="modal-details">
      <div class="modal-row"><span class="micon">📍</span><span class="mtext">${formatDist(item.dist)} van jouw locatie</span></div>
      ${address ? `<div class="modal-row"><span class="micon">🏠</span><span class="mtext">${escHtml(address)}</span></div>` : ''}
      ${hours   ? `<div class="modal-row"><span class="micon">🕐</span><span class="mtext">${escHtml(hours)}</span></div>` : ''}
      ${phone   ? `<div class="modal-row"><span class="micon">📞</span><span class="mtext"><a href="tel:${escHtml(phone)}">${escHtml(phone)}</a></span></div>` : ''}
      ${website ? `<div class="modal-row"><span class="micon">🌐</span><span class="mtext"><a href="${escHtml(website)}" target="_blank" rel="noopener noreferrer">${escHtml(website)}</a></span></div>` : ''}
      ${item.rating   ? `<div class="modal-row"><span class="micon">⭐</span><span class="mtext">Beoordeling: ${item.rating}</span></div>` : ''}
      ${item.capacity ? `<div class="modal-row"><span class="micon">👥</span><span class="mtext">Capaciteit: ${item.capacity} personen</span></div>` : ''}
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

  html += `<div class="osm-link"><a href="${osmUrl}" target="_blank" rel="noopener noreferrer">Bekijk op OpenStreetMap ↗</a></div>`;

  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('detail-modal').classList.remove('hidden');
}

function buildBookingLinks(item) {
  const lat  = item.lat.toFixed(5);
  const lon  = item.lon.toFixed(5);
  const name = encodeURIComponent(item.name);
  const gmapsSearch = (term) =>
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
    <div class="modal-booking-label">Zoek & boek in de buurt</div>
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

const toRad          = d  => d * Math.PI / 180;
const formatDist     = km => km < 1 ? `${Math.round(km*1000)} m` : `${km.toFixed(1)} km`;
const minutesToMeters = (min, mode) => Math.ceil((SPEEDS[mode] * min / 60) * 1000);
const transportLabel  = mode => ({ driving: 'auto', cycling: 'fiets', walking: 'lopen' })[mode] ?? mode;

function formatTravelTime(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} uur` : `${h},5 uur`;
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
  if (status === 'open')   return `<span class="result-open open">● Open</span>`;
  if (status === 'closed') return `<span class="result-open closed">● Gesloten</span>`;
  return '';
}

function openBadgeFull(status) {
  if (status === 'open')   return `<span class="badge" style="background:#dcfce7;color:#15803d">● Nu open</span>`;
  if (status === 'closed') return `<span class="badge" style="background:#fee2e2;color:#b91c1c">● Gesloten</span>`;
  return `<span class="badge" style="background:#f1f5f9;color:#64748b">Tijden onbekend</span>`;
}

function makePopupHtml(item) {
  return `
    <div class="popup-name">${escHtml(item.name)}</div>
    <div style="color:${item.catInfo.color};font-size:12px">${item.catInfo.icon} ${item.catInfo.label}</div>
    <div style="font-size:11px;color:#64748b;margin-top:3px">📍 ${formatDist(item.dist)}</div>
    ${item.stars ? `<div style="font-size:12px">${'⭐'.repeat(Math.min(item.stars,5))}</div>` : ''}
    ${item.openStat !== 'unknown' ? `<div style="font-size:11px;font-weight:700;margin-top:2px;color:${item.openStat==='open'?'#15803d':'#b91c1c'}">${item.openStat==='open'?'● Open':'● Gesloten'}</div>` : ''}
  `;
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
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Bezig…`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> Zoeken`;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.add('hidden'), 3000);
}

// ── Boot ───────────────────────────────────────────────────
initMap();
initUI();
