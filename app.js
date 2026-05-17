'use strict';

// ── Config ─────────────────────────────────────────────────
const VALHALLA = 'https://valhalla1.openstreetmap.de/isochrone';
const OVERPASS = 'https://overpass-api.de/api/interpreter';
const COSTING  = { driving: 'auto', cycling: 'bicycle', walking: 'pedestrian' };
const SPEEDS   = { driving: 40, cycling: 15, walking: 5 };

const CATEGORY_MAP = {
  cafe:        { label: 'Koffie',      icon: '☕', color: '#d97706',
                 queries: ['node[amenity=cafe]', 'way[amenity=cafe]'] },
  restaurant:  { label: 'Restaurant',  icon: '🍽️', color: '#dc2626',
                 queries: ['node[amenity=restaurant]', 'way[amenity=restaurant]'] },
  bar:         { label: 'Bar',         icon: '🍺', color: '#7c3aed',
                 queries: ['node[amenity=bar]', 'way[amenity=bar]'] },
  museum:      { label: 'Museum',      icon: '🏛️', color: '#0891b2',
                 queries: ['node[tourism=museum]', 'way[tourism=museum]'] },
  park:        { label: 'Park',        icon: '🌳', color: '#16a34a',
                 queries: ['node[leisure=park]', 'way[leisure=park]'] },
  hiking:      { label: 'Wandelen',    icon: '🥾', color: '#65a30d',
                 queries: ['relation[route=hiking]', 'node[leisure=nature_reserve]', 'way[leisure=nature_reserve]'] },
  supermarket: { label: 'Supermarkt',  icon: '🛒', color: '#ea580c',
                 queries: ['node[shop=supermarket]', 'way[shop=supermarket]'] },
  library:     { label: 'Bibliotheek', icon: '📚', color: '#4f46e5',
                 queries: ['node[amenity=library]', 'way[amenity=library]'] },
  cinema:      { label: 'Bioscoop',    icon: '🎬', color: '#db2777',
                 queries: ['node[amenity=cinema]', 'way[amenity=cinema]'] },
  bakery:      { label: 'Bakkerij',    icon: '🥐', color: '#b45309',
                 queries: ['node[shop=bakery]', 'way[shop=bakery]'] },
  fast_food:   { label: 'Fastfood',    icon: '🍔', color: '#e11d48',
                 queries: ['node[amenity=fast_food]', 'way[amenity=fast_food]'] },
  playground:  { label: 'Speeltuin',   icon: '🛝', color: '#059669',
                 queries: ['node[leisure=playground]', 'way[leisure=playground]'] },
};

// ── State ──────────────────────────────────────────────────
let map, isoLayer, markersLayer;
let userLocation    = null;
let selectedCats    = new Set(['cafe']);
let selectedMode    = 'driving';
let allResults      = [];   // all fetched+processed results
let visibleCats     = new Set();
let acTimer         = null;
let currentSort     = 'distance';
let openNow         = false;

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
  document.getElementById('gps-btn').addEventListener('click', getGPS);

  const slider = document.getElementById('time-slider');
  slider.addEventListener('input', () => {
    document.getElementById('time-display').textContent = `${slider.value} min`;
  });

  document.querySelectorAll('.transport-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.transport-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMode = btn.dataset.mode;
    });
  });

  // Category multi-select
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      if (selectedCats.has(cat)) {
        if (selectedCats.size === 1) return; // always keep ≥1
        selectedCats.delete(cat);
      } else {
        selectedCats.add(cat);
      }
      syncCatButtons();
    });
  });
  syncCatButtons();

  document.getElementById('search-btn').addEventListener('click', doSearch);

  document.getElementById('open-now-filter').addEventListener('change', e => {
    openNow = e.target.checked;
    if (allResults.length) renderList();
  });

  document.getElementById('sort-select').addEventListener('change', e => {
    currentSort = e.target.value;
    if (allResults.length) renderList();
  });

  // Location autocomplete
  const input = document.getElementById('location-input');
  input.addEventListener('input', () => {
    clearTimeout(acTimer);
    const q = input.value.trim();
    if (q.length < 3) { hideAC(); return; }
    acTimer = setTimeout(() => fetchAC(q), 350);
  });
  input.addEventListener('keydown', e => { if (e.key === 'Escape') hideAC(); });
  document.addEventListener('click', e => {
    if (!e.target.closest('.autocomplete-wrapper')) hideAC();
  });

  // Modal
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('detail-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('detail-modal')) closeModal();
  });

  // Category filter chips (post-search)
  document.getElementById('cat-filter-bar').addEventListener('click', e => {
    const chip = e.target.closest('.cat-chip');
    if (!chip) return;
    const cat = chip.dataset.cat;
    if (visibleCats.has(cat)) {
      if (visibleCats.size === 1) return;
      visibleCats.delete(cat);
    } else {
      visibleCats.add(cat);
    }
    syncCatChips();
    renderList();
  });

  // Surprise button
  document.getElementById('surprise-btn').addEventListener('click', surpriseMe);
}

function syncCatButtons() {
  document.querySelectorAll('.cat-btn').forEach(btn => {
    const cat  = btn.dataset.cat;
    const ci   = CATEGORY_MAP[cat];
    const active = selectedCats.has(cat);
    btn.classList.toggle('active', active);
    if (active) {
      btn.style.borderColor = ci.color;
      btn.style.color       = ci.color;
      btn.style.background  = hexAlpha(ci.color, 0.1);
    } else {
      btn.style.borderColor = '';
      btn.style.color       = '';
      btn.style.background  = '';
    }
  });
}

// ── GPS ────────────────────────────────────────────────────
function getGPS() {
  if (!navigator.geolocation) { showToast('GPS niet beschikbaar in deze browser.'); return; }
  const btn = document.getElementById('gps-btn');
  btn.classList.add('loading');
  navigator.geolocation.getCurrentPosition(
    pos => {
      btn.classList.remove('loading');
      setUserLocation(pos.coords.latitude, pos.coords.longitude, 'Mijn GPS-locatie');
      showToast('GPS-locatie gevonden!');
    },
    () => {
      btn.classList.remove('loading');
      showToast('GPS mislukt. Typ een adres in.');
    },
    { timeout: 10000 }
  );
}

function setUserLocation(lat, lon, label) {
  userLocation = { lat, lon };
  document.getElementById('location-input').value = label;
  map.setView([lat, lon], 13);
}

// ── Autocomplete (Nominatim) ───────────────────────────────
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
  } catch { /* network hiccup */ }
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
  // Resolve location if needed
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
    // 1. Fetch isochrone from Valhalla (with circle fallback)
    let polyStr      = null;
    let usedFallback = false;

    try {
      const iso = await fetchIsochrone(userLocation, minutes, selectedMode);
      polyStr    = isoToOverpassPoly(iso);
      drawIsochrone(iso);
    } catch (err) {
      console.warn('Valhalla unavailable, falling back to radius circle:', err.message);
      usedFallback = true;
      const radiusM = minutesToMeters(minutes, selectedMode);
      drawCircleFallback(userLocation, radiusM);
    }

    // 2. Fetch all selected categories in parallel
    const cats    = [...selectedCats];
    const radiusM = usedFallback ? minutesToMeters(minutes, selectedMode) : null;

    const rawResults = await Promise.all(
      cats.map(cat => fetchPlaces(cat, polyStr, userLocation, radiusM))
    );

    // 3. Process & display
    allResults  = processResults(rawResults.flat(), userLocation);
    visibleCats = new Set(cats);

    syncCatChips();
    renderResults(minutes, usedFallback);

  } catch (err) {
    console.error(err);
    showToast('Zoeken mislukt. Probeer het opnieuw.');
  } finally {
    setSearching(false);
  }
}

// ── Isochrone (Valhalla) ───────────────────────────────────
async function fetchIsochrone(loc, minutes, mode) {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), 14000);
  try {
    const res = await fetch(VALHALLA, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locations: [{ lat: loc.lat, lon: loc.lon }],
        costing:   COSTING[mode],
        contours:  [{ time: minutes }],
        polygons:  true,
        denoise:   0.5,
        generalize: 80,
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

// Convert GeoJSON polygon → Overpass poly string (max ~70 points)
function isoToOverpassPoly(geojson) {
  const feature = geojson.features?.[0];
  if (!feature) throw new Error('No feature in isochrone response');
  const coords = feature.geometry.type === 'Polygon'
    ? feature.geometry.coordinates[0]
    : feature.geometry.coordinates[0][0]; // MultiPolygon fallback
  const step = Math.max(1, Math.floor(coords.length / 70));
  return coords
    .filter((_, i) => i % step === 0)
    .map(([lon, lat]) => `${lat.toFixed(5)} ${lon.toFixed(5)}`)
    .join(' ');
}

function drawIsochrone(geojson) {
  isoLayer.clearLayers();
  L.geoJSON(geojson, {
    style: {
      color:       '#2563eb',
      fillColor:   '#2563eb',
      fillOpacity: 0.06,
      weight:      2.5,
      dashArray:   '7 4',
    },
  }).addTo(isoLayer);
  addUserMarker();
  try {
    map.fitBounds(L.geoJSON(geojson).getBounds(), { padding: [30, 30] });
  } catch {}
}

function drawCircleFallback(loc, radiusM) {
  isoLayer.clearLayers();
  L.circle([loc.lat, loc.lon], {
    radius:      radiusM,
    color:       '#2563eb',
    fillColor:   '#2563eb',
    fillOpacity: 0.06,
    weight:      2,
    dashArray:   '7 4',
  }).addTo(isoLayer);
  addUserMarker();
}

function addUserMarker() {
  L.circleMarker([userLocation.lat, userLocation.lon], {
    radius: 9, color: '#fff', fillColor: '#2563eb', fillOpacity: 1, weight: 3,
  }).bindPopup('<b>Mijn locatie</b>').addTo(isoLayer);
}

// ── Overpass fetch ─────────────────────────────────────────
async function fetchPlaces(cat, polyStr, loc, radiusM) {
  const catInfo = CATEGORY_MAP[cat];
  const filter  = polyStr
    ? `(poly:"${polyStr}")`
    : `(around:${Math.ceil(radiusM)},${loc.lat},${loc.lon})`;

  const lines = catInfo.queries.map(q => `  ${q}${filter};`).join('\n');
  const query = `[out:json][timeout:30];\n(\n${lines}\n);\nout center tags;`;

  const res = await fetch(OVERPASS, { method: 'POST', body: query });
  if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
  const data = await res.json();
  return (data.elements || []).map(el => ({ ...el, _cat: cat }));
}

// ── Process results ────────────────────────────────────────
function processResults(elements, loc) {
  const seen = new Set();
  return elements.map(el => {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (!lat || !lon) return null;

    // Deduplicate by rounded coordinates
    const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    if (seen.has(key)) return null;
    seen.add(key);

    const tags     = el.tags || {};
    const cat      = el._cat;
    const catInfo  = CATEGORY_MAP[cat];
    const name     = tags.name || tags['name:nl'] || `(${catInfo.label})`;
    const dist     = haversineKm(loc.lat, loc.lon, lat, lon);
    const openStat = getOpenStatus(tags);
    const rating   = parseRating(tags);

    return { id: el.id, type: el.type, cat, catInfo, name, lat, lon, dist, tags, openStat, rating };
  }).filter(Boolean);
}

// ── Render ─────────────────────────────────────────────────
function renderResults(minutes, usedFallback) {
  const modeName = selectedMode === 'driving' ? 'auto' : selectedMode === 'cycling' ? 'fiets' : 'lopen';
  const method   = usedFallback ? 'geschatte cirkel' : `wegennetwerk · ${modeName}`;
  document.getElementById('radius-info').textContent = `${minutes} min · ${method}`;
  document.getElementById('results-header').classList.remove('hidden');
  renderList();
}

function renderList() {
  markersLayer.clearLayers();
  const list = document.getElementById('results-list');
  list.innerHTML = '';

  let items = allResults.filter(i => visibleCats.has(i.cat));
  if (openNow) items = items.filter(i => i.openStat === 'open');

  if (currentSort === 'distance')     items.sort((a, b) => a.dist - b.dist);
  else if (currentSort === 'rating')  items.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
  else                                items.sort((a, b) => a.name.localeCompare(b.name, 'nl'));

  document.getElementById('results-count').textContent = `${items.length} locatie${items.length !== 1 ? 's' : ''}`;

  if (!items.length) {
    list.innerHTML = '<li style="text-align:center;color:var(--text-muted);padding:24px;font-size:13px;">Geen resultaten. Pas de filters aan of vergroot de reistijd.</li>';
    return;
  }

  const displayed = items.slice(0, 100);
  displayed.forEach((item, idx) => {
    const marker = L.marker([item.lat, item.lon], { icon: makeIcon(item.catInfo.color) })
      .bindPopup(makePopupHtml(item))
      .addTo(markersLayer);

    marker.on('click', () => highlightItem(item.id));

    const li        = document.createElement('li');
    li.className    = 'result-item';
    li.dataset.id   = item.id;
    li.style.animationDelay = `${Math.min(idx * 12, 240)}ms`;
    li.innerHTML    = `
      <div class="result-top">
        <span class="result-cat-dot" style="background:${item.catInfo.color}"></span>
        <span class="result-name">${escHtml(item.name)}</span>
      </div>
      <div class="result-meta">
        <span class="result-type" style="border-color:${item.catInfo.color}40;color:${item.catInfo.color};background:${hexAlpha(item.catInfo.color, 0.08)}">${item.catInfo.icon} ${item.catInfo.label}</span>
        <span class="result-dist">📍 ${formatDist(item.dist)}</span>
        ${openBadge(item.openStat)}
        ${item.rating ? `<span class="result-rating">⭐ ${item.rating}</span>` : ''}
      </div>
    `;
    li.addEventListener('click', () => {
      map.setView([item.lat, item.lon], 16);
      marker.openPopup();
      highlightItem(item.id);
      showDetailModal(item);
    });
    list.appendChild(li);
  });

  if (items.length > 100) {
    const note = document.createElement('li');
    note.style.cssText = 'text-align:center;color:var(--text-muted);font-size:11px;padding:8px;';
    note.textContent = `+ ${items.length - 100} meer resultaten — zoom in of verklein de reistijd`;
    list.appendChild(note);
  }
}

function highlightItem(id) {
  document.querySelectorAll('.result-item').forEach(el => {
    el.classList.toggle('highlighted', el.dataset.id == id);
  });
  const el = document.querySelector(`.result-item[data-id="${id}"]`);
  if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// ── Surprise me ────────────────────────────────────────────
function surpriseMe() {
  let items = allResults.filter(i => visibleCats.has(i.cat));
  if (openNow) items = items.filter(i => i.openStat === 'open');
  if (!items.length) { showToast('Geen resultaten om van te verrassen!'); return; }
  const item = items[Math.floor(Math.random() * items.length)];
  map.setView([item.lat, item.lon], 16);
  highlightItem(item.id);
  showDetailModal(item);
}

// ── Category chips (post-search filter) ───────────────────
function syncCatChips() {
  const bar     = document.getElementById('cat-filter-bar');
  const section = document.getElementById('cat-filter-section');
  const cats    = [...selectedCats];

  if (cats.length <= 1) { section.classList.add('hidden'); return; }
  section.classList.remove('hidden');

  const counts = {};
  allResults.forEach(r => { counts[r.cat] = (counts[r.cat] || 0) + 1; });

  bar.innerHTML = cats.map(cat => {
    const ci     = CATEGORY_MAP[cat];
    const active = visibleCats.has(cat);
    const n      = counts[cat] || 0;
    return `<button class="cat-chip ${active ? 'active' : ''}" data-cat="${cat}" style="--chip-color:${ci.color}">
      ${ci.icon} ${ci.label}<span class="chip-count">${n}</span>
    </button>`;
  }).join('');
}

// ── Detail modal ───────────────────────────────────────────
function showDetailModal(item) {
  const tags    = item.tags;
  const osmUrl  = `https://www.openstreetmap.org/${item.type}/${item.id}`;
  const gmaps   = `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lon}`;
  const amaps   = `https://maps.apple.com/?daddr=${item.lat},${item.lon}`;
  const website = tags.website || tags['contact:website'];
  const phone   = tags.phone   || tags['contact:phone'];
  const address = buildAddress(tags);
  const hours   = tags.opening_hours;

  document.getElementById('modal-body').innerHTML = `
    <div class="modal-name">${escHtml(item.name)}</div>
    <div class="modal-badges">
      <span class="badge" style="background:${hexAlpha(item.catInfo.color, 0.12)};color:${item.catInfo.color}">${item.catInfo.icon} ${item.catInfo.label}</span>
      ${openBadgeFull(item.openStat)}
    </div>
    <div class="modal-details">
      <div class="modal-row"><span class="micon">📍</span><span class="mtext">${formatDist(item.dist)} van jouw locatie</span></div>
      ${address ? `<div class="modal-row"><span class="micon">🏠</span><span class="mtext">${escHtml(address)}</span></div>` : ''}
      ${hours   ? `<div class="modal-row"><span class="micon">🕐</span><span class="mtext">${escHtml(hours)}</span></div>` : ''}
      ${phone   ? `<div class="modal-row"><span class="micon">📞</span><span class="mtext"><a href="tel:${escHtml(phone)}">${escHtml(phone)}</a></span></div>` : ''}
      ${website ? `<div class="modal-row"><span class="micon">🌐</span><span class="mtext"><a href="${escHtml(website)}" target="_blank" rel="noopener noreferrer">${escHtml(website)}</a></span></div>` : ''}
      ${item.rating ? `<div class="modal-row"><span class="micon">⭐</span><span class="mtext">${item.rating} / 5</span></div>` : ''}
    </div>
    <div class="modal-nav-btns">
      <a class="nav-btn nav-gmaps" href="${gmaps}" target="_blank" rel="noopener noreferrer">🗺️ Google Maps</a>
      <a class="nav-btn nav-amaps" href="${amaps}" target="_blank" rel="noopener noreferrer">🍎 Apple Maps</a>
    </div>
    <div class="osm-link"><a href="${osmUrl}" target="_blank" rel="noopener noreferrer">Bekijk op OpenStreetMap ↗</a></div>
  `;
  document.getElementById('detail-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('detail-modal').classList.add('hidden');
}

// ── Helpers ────────────────────────────────────────────────
function haversineKm(lat1, lon1, lat2, lon2) {
  const R    = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a    = Math.sin(dLat / 2) ** 2
             + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
const toRad         = d  => d * Math.PI / 180;
const formatDist    = km => km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
const minutesToMeters = (min, mode) => Math.ceil((SPEEDS[mode] * min / 60) * 1000);

function hexAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
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
  const now     = new Date();
  const DAYS    = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const ORDER   = { Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6, Su: 7 };
  const today   = ORDER[DAYS[now.getDay()]];
  const nowMin  = now.getHours() * 60 + now.getMinutes();

  for (const rule of oh.split(';').map(r => r.trim()).filter(Boolean)) {
    const m = rule.match(/^([A-Za-z,\- ]+?)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
    if (!m) continue;
    if (!dayMatches(m[1].trim(), today, ORDER)) continue;
    const s = timeToMin(m[2]);
    const e = timeToMin(m[3]);
    if (e < s) return nowMin >= s || nowMin < e;  // overnight
    return nowMin >= s && nowMin < e;
  }
  return false;
}

function dayMatches(part, today, order) {
  return part.split(',').map(s => s.trim()).some(p => {
    const range = p.match(/^([A-Z][a-z])-([A-Z][a-z])$/);
    if (range) {
      const s = order[range[1]], e = order[range[2]];
      return s && e && today >= s && today <= e;
    }
    return order[p] === today;
  });
}

function timeToMin(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

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
    ${item.openStat !== 'unknown' ? `<div style="font-size:11px;font-weight:700;margin-top:2px;color:${item.openStat === 'open' ? '#15803d' : '#b91c1c'}">${item.openStat === 'open' ? '● Open' : '● Gesloten'}</div>` : ''}
  `;
}

function makeIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);transform:rotate(-45deg)"></div>`,
    iconSize:   [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -28],
  });
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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
