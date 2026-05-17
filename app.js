'use strict';

// ── Constants ──────────────────────────────────────────────
const SPEEDS_KMH = { driving: 40, cycling: 15, walking: 5 };

const CATEGORY_MAP = {
  cafe:        { label: 'Koffie / Café',  icon: '☕', query: '[amenity=cafe]' },
  restaurant:  { label: 'Restaurant',     icon: '🍽️', query: '[amenity=restaurant]' },
  bar:         { label: 'Bar / Café',     icon: '🍺', query: '[amenity=bar]' },
  museum:      { label: 'Museum',         icon: '🏛️', query: '[tourism=museum]' },
  park:        { label: 'Park',           icon: '🌳', query: '[leisure=park]' },
  hiking:      { label: 'Wandeling',      icon: '🥾', query: '[route=hiking]', isRelation: true },
  supermarket: { label: 'Supermarkt',     icon: '🛒', query: '[shop=supermarket]' },
  library:     { label: 'Bibliotheek',    icon: '📚', query: '[amenity=library]' },
  cinema:      { label: 'Bioscoop',       icon: '🎬', query: '[amenity=cinema]' },
  bakery:      { label: 'Bakkerij',       icon: '🥐', query: '[shop=bakery]' },
  fast_food:   { label: 'Fastfood',       icon: '🍔', query: '[amenity=fast_food]' },
  playground:  { label: 'Speeltuin',      icon: '🛝', query: '[leisure=playground]' },
};

// ── State ──────────────────────────────────────────────────
let map, circleLayer, markersLayer;
let userLocation = null;   // { lat, lon }
let selectedCategory = 'cafe';
let selectedMode = 'driving';
let currentResults = [];
let autocompleteTimer = null;

// ── Map init ───────────────────────────────────────────────
function initMap() {
  map = L.map('map', { zoomControl: true }).setView([52.3, 5.3], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  circleLayer = L.layerGroup().addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

// ── UI wiring ──────────────────────────────────────────────
function initUI() {
  // GPS button
  document.getElementById('gps-btn').addEventListener('click', getGPSLocation);

  // Time slider
  const slider = document.getElementById('time-slider');
  const display = document.getElementById('time-display');
  slider.addEventListener('input', () => { display.textContent = `${slider.value} min`; });

  // Transport
  document.querySelectorAll('.transport-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.transport-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMode = btn.dataset.mode;
    });
  });

  // Categories
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCategory = btn.dataset.cat;
    });
  });

  // Search
  document.getElementById('search-btn').addEventListener('click', doSearch);

  // Location autocomplete
  const input = document.getElementById('location-input');
  input.addEventListener('input', () => {
    clearTimeout(autocompleteTimer);
    const q = input.value.trim();
    if (q.length < 3) { hideAutocomplete(); return; }
    autocompleteTimer = setTimeout(() => fetchAutocomplete(q), 350);
  });
  input.addEventListener('keydown', e => { if (e.key === 'Escape') hideAutocomplete(); });
  document.addEventListener('click', e => {
    if (!e.target.closest('.autocomplete-wrapper')) hideAutocomplete();
  });

  // Modal close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('detail-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('detail-modal')) closeModal();
  });
}

// ── GPS ────────────────────────────────────────────────────
function getGPSLocation() {
  if (!navigator.geolocation) { showToast('GPS niet beschikbaar in deze browser.'); return; }
  const btn = document.getElementById('gps-btn');
  btn.classList.add('loading');
  navigator.geolocation.getCurrentPosition(
    pos => {
      btn.classList.remove('loading');
      userLocation = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      document.getElementById('location-input').value = `${userLocation.lat.toFixed(5)}, ${userLocation.lon.toFixed(5)}`;
      map.setView([userLocation.lat, userLocation.lon], 13);
      showToast('GPS-locatie gevonden!');
    },
    err => {
      btn.classList.remove('loading');
      showToast('GPS-locatie ophalen mislukt. Typ een adres in.');
    },
    { timeout: 10000 }
  );
}

// ── Autocomplete (Nominatim) ───────────────────────────────
async function fetchAutocomplete(q) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=0&q=${encodeURIComponent(q)}&accept-language=nl`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'nl' } });
    const data = await res.json();
    showAutocomplete(data);
  } catch { /* network error – silently ignore */ }
}

function showAutocomplete(items) {
  const list = document.getElementById('autocomplete-list');
  list.innerHTML = '';
  if (!items.length) { list.classList.add('hidden'); return; }
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.display_name;
    li.addEventListener('click', () => {
      userLocation = { lat: parseFloat(item.lat), lon: parseFloat(item.lon) };
      document.getElementById('location-input').value = item.display_name;
      map.setView([userLocation.lat, userLocation.lon], 13);
      hideAutocomplete();
    });
    list.appendChild(li);
  });
  list.classList.remove('hidden');
}

function hideAutocomplete() {
  document.getElementById('autocomplete-list').classList.add('hidden');
}

// ── Search ─────────────────────────────────────────────────
async function doSearch() {
  if (!userLocation) {
    // Try to geocode what's in the input field
    const q = document.getElementById('location-input').value.trim();
    if (!q) { showToast('Voer eerst een locatie in of gebruik GPS.'); return; }
    showToast('Locatie zoeken…');
    const resolved = await geocode(q);
    if (!resolved) { showToast('Locatie niet gevonden. Probeer een ander adres.'); return; }
    userLocation = resolved;
    map.setView([userLocation.lat, userLocation.lon], 13);
  }

  const minutes = parseInt(document.getElementById('time-slider').value);
  const speed = SPEEDS_KMH[selectedMode];
  const radiusKm = (speed * minutes) / 60;
  const radiusM = radiusKm * 1000;

  const btn = document.getElementById('search-btn');
  btn.classList.add('loading');
  btn.textContent = 'Zoeken…';

  try {
    drawCircle(userLocation, radiusM);
    const places = await fetchPlaces(userLocation, radiusM, selectedCategory);
    currentResults = processResults(places, userLocation);
    renderResults(currentResults, radiusKm, minutes);
  } catch (err) {
    showToast('Fout bij ophalen van locaties. Probeer het opnieuw.');
    console.error(err);
  } finally {
    btn.classList.remove('loading');
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> Zoeken`;
  }
}

async function geocode(q) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch { return null; }
}

// ── Draw circle ────────────────────────────────────────────
function drawCircle(loc, radiusM) {
  circleLayer.clearLayers();
  L.circle([loc.lat, loc.lon], {
    radius: radiusM,
    color: '#2563eb',
    fillColor: '#2563eb',
    fillOpacity: 0.08,
    weight: 2,
    dashArray: '6 4',
  }).addTo(circleLayer);

  // User marker
  L.circleMarker([loc.lat, loc.lon], {
    radius: 8,
    color: '#fff',
    fillColor: '#2563eb',
    fillOpacity: 1,
    weight: 3,
  }).bindPopup('<b>Mijn locatie</b>').addTo(circleLayer);
}

// ── Overpass query ─────────────────────────────────────────
async function fetchPlaces(loc, radiusM, cat) {
  const catInfo = CATEGORY_MAP[cat];
  const r = Math.ceil(radiusM);

  let query;
  if (catInfo.isRelation) {
    // Hiking routes: use relations within bounding box
    query = `[out:json][timeout:25];
relation${catInfo.query}(around:${r},${loc.lat},${loc.lon});
out center tags;`;
  } else {
    // Regular nodes + ways
    query = `[out:json][timeout:25];
(
  node${catInfo.query}(around:${r},${loc.lat},${loc.lon});
  way${catInfo.query}(around:${r},${loc.lat},${loc.lon});
);
out center tags;`;
  }

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });
  if (!res.ok) throw new Error(`Overpass error ${res.status}`);
  const data = await res.json();
  return data.elements || [];
}

// ── Process results ────────────────────────────────────────
function processResults(elements, loc) {
  const catInfo = CATEGORY_MAP[selectedCategory];
  const openNow = document.getElementById('open-now-filter').checked;
  const sortBy = document.getElementById('sort-select').value;

  let items = elements.map(el => {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (!lat || !lon) return null;

    const tags = el.tags || {};
    const name = tags.name || tags['name:nl'] || tags['name:en'] || `(${catInfo.label})`;
    const dist = haversineKm(loc.lat, loc.lon, lat, lon);
    const openStatus = getOpenStatus(tags);
    const rating = parseRating(tags);

    return { id: el.id, type: el.type, name, lat, lon, dist, tags, openStatus, rating, catInfo };
  }).filter(Boolean);

  if (openNow) items = items.filter(i => i.openStatus === 'open');

  if (sortBy === 'distance') items.sort((a, b) => a.dist - b.dist);
  else if (sortBy === 'rating') items.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
  else items.sort((a, b) => a.name.localeCompare(b.name, 'nl'));

  return items.slice(0, 80); // cap to avoid rendering too many markers
}

// ── Render results ─────────────────────────────────────────
function renderResults(items, radiusKm, minutes) {
  markersLayer.clearLayers();

  const header = document.getElementById('results-header');
  const list = document.getElementById('results-list');
  const count = document.getElementById('results-count');
  const info = document.getElementById('radius-info');

  header.classList.remove('hidden');
  count.textContent = `${items.length} locaties gevonden`;
  info.textContent = `± ${radiusKm.toFixed(1)} km · ${minutes} min`;

  list.innerHTML = '';

  if (!items.length) {
    const li = document.createElement('li');
    li.style.cssText = 'text-align:center;color:var(--text-muted);padding:24px;font-size:13px;';
    li.textContent = 'Geen resultaten gevonden. Vergroot de reistijd of kies een andere categorie.';
    list.appendChild(li);
    return;
  }

  const icon = makeLeafletIcon();

  items.forEach((item, idx) => {
    // Marker
    const marker = L.marker([item.lat, item.lon], { icon })
      .bindPopup(makePopupHtml(item))
      .addTo(markersLayer);

    marker.on('click', () => highlightItem(idx));

    // List item
    const li = document.createElement('li');
    li.className = 'result-item';
    li.style.animationDelay = `${idx * 20}ms`;
    li.innerHTML = `
      <div class="result-name">${escHtml(item.name)}</div>
      <div class="result-meta">
        <span class="result-type">${item.catInfo.icon} ${item.catInfo.label}</span>
        <span class="result-dist">📍 ${formatDist(item.dist)}</span>
        ${openBadge(item.openStatus)}
        ${item.rating ? `<span class="result-rating">⭐ ${item.rating}</span>` : ''}
      </div>
    `;
    li.addEventListener('click', () => {
      map.setView([item.lat, item.lon], 16);
      marker.openPopup();
      highlightItem(idx);
      showDetailModal(item);
    });
    li.dataset.idx = idx;
    list.appendChild(li);
  });

  // Fit bounds to show circle + markers
  if (userLocation) {
    const bounds = L.latLng(userLocation.lat, userLocation.lon).toBounds(
      parseInt(document.getElementById('time-slider').value) * SPEEDS_KMH[selectedMode] * 1000 / 60 * 2
    );
    map.fitBounds(bounds, { padding: [40, 40] });
  }
}

function highlightItem(idx) {
  document.querySelectorAll('.result-item').forEach((el, i) => {
    el.classList.toggle('highlighted', i === idx);
  });
  // Scroll item into view
  const el = document.querySelector(`.result-item[data-idx="${idx}"]`);
  if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// ── Detail modal ───────────────────────────────────────────
function showDetailModal(item) {
  const tags = item.tags;
  const modal = document.getElementById('detail-modal');
  const body = document.getElementById('modal-body');

  const website = tags.website || tags['contact:website'];
  const phone = tags.phone || tags['contact:phone'];
  const address = buildAddress(tags);
  const hours = tags.opening_hours;
  const osmUrl = `https://www.openstreetmap.org/${item.type}/${item.id}`;

  body.innerHTML = `
    <div class="modal-name">${escHtml(item.name)}</div>
    <div class="modal-badges">
      <span class="badge badge-type">${item.catInfo.icon} ${item.catInfo.label}</span>
      ${openBadgeFull(item.openStatus)}
    </div>
    <div class="modal-details">
      <div class="modal-detail-row">
        <span class="modal-detail-icon">📍</span>
        <span class="modal-detail-text">${formatDist(item.dist)} van jouw locatie</span>
      </div>
      ${address ? `<div class="modal-detail-row"><span class="modal-detail-icon">🏠</span><span class="modal-detail-text">${escHtml(address)}</span></div>` : ''}
      ${hours ? `<div class="modal-detail-row"><span class="modal-detail-icon">🕐</span><span class="modal-detail-text">${escHtml(hours)}</span></div>` : ''}
      ${phone ? `<div class="modal-detail-row"><span class="modal-detail-icon">📞</span><span class="modal-detail-text"><a href="tel:${escHtml(phone)}">${escHtml(phone)}</a></span></div>` : ''}
      ${website ? `<div class="modal-detail-row"><span class="modal-detail-icon">🌐</span><span class="modal-detail-text"><a href="${escHtml(website)}" target="_blank" rel="noopener">${escHtml(website)}</a></span></div>` : ''}
      ${item.rating ? `<div class="modal-detail-row"><span class="modal-detail-icon">⭐</span><span class="modal-detail-text">Beoordeling: ${item.rating}</span></div>` : ''}
    </div>
    <div class="osm-link"><a href="${osmUrl}" target="_blank" rel="noopener">🗺️ Bekijk op OpenStreetMap</a></div>
  `;

  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('detail-modal').classList.add('hidden');
}

// ── Helpers ────────────────────────────────────────────────
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
const toRad = d => d * Math.PI / 180;

function formatDist(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function getOpenStatus(tags) {
  const oh = tags.opening_hours;
  if (!oh) return 'unknown';
  // Very basic heuristic: check for "24/7"
  if (oh === '24/7') return 'open';
  // Try to parse simple "Mo-Fr HH:MM-HH:MM" patterns
  try {
    return evaluateOpeningHours(oh) ? 'open' : 'closed';
  } catch {
    return 'unknown';
  }
}

function evaluateOpeningHours(oh) {
  const now = new Date();
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const todayAbbr = dayNames[now.getDay()];
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const DAY_ORDER = { Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6, Su: 7 };
  const todayIdx = DAY_ORDER[todayAbbr];

  // Split on ";" for multiple rules
  const rules = oh.split(';').map(r => r.trim()).filter(Boolean);

  for (const rule of rules) {
    // Match patterns like: "Mo-Fr 08:00-18:00" or "Mo,We,Fr 09:00-17:00"
    const m = rule.match(/^([A-Za-z,\- ]+?)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
    if (!m) continue;

    const dayPart = m[1].trim();
    const startMin = timeToMin(m[2]);
    const endMin = timeToMin(m[3]);

    if (dayMatches(dayPart, todayIdx, DAY_ORDER)) {
      if (endMin < startMin) {
        // overnight
        return nowMin >= startMin || nowMin < endMin;
      }
      return nowMin >= startMin && nowMin < endMin;
    }
  }
  return false;
}

function dayMatches(dayPart, todayIdx, order) {
  // Handle comma-separated: "Mo,We,Fr"
  const parts = dayPart.split(',').map(s => s.trim());
  for (const part of parts) {
    // Range like "Mo-Fr"
    const range = part.match(/^([A-Z][a-z])-([A-Z][a-z])$/);
    if (range) {
      const s = order[range[1]], e = order[range[2]];
      if (s && e && todayIdx >= s && todayIdx <= e) return true;
    } else {
      if (order[part] === todayIdx) return true;
    }
  }
  return false;
}

function timeToMin(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function parseRating(tags) {
  // OSM doesn't have star ratings natively; some mappers add stars= or rating=
  const r = tags.stars || tags.rating;
  if (!r) return null;
  const n = parseFloat(r);
  return isNaN(n) ? null : n;
}

function buildAddress(tags) {
  const parts = [
    tags['addr:street'] && tags['addr:housenumber']
      ? `${tags['addr:street']} ${tags['addr:housenumber']}`
      : tags['addr:street'],
    tags['addr:city'] || tags['addr:town'],
  ].filter(Boolean);
  return parts.join(', ');
}

function openBadge(status) {
  if (status === 'open') return `<span class="result-open open">● Open</span>`;
  if (status === 'closed') return `<span class="result-open closed">● Gesloten</span>`;
  return '';
}

function openBadgeFull(status) {
  if (status === 'open') return `<span class="badge badge-open">● Nu open</span>`;
  if (status === 'closed') return `<span class="badge badge-closed">● Gesloten</span>`;
  return `<span class="badge badge-unknown">Openingstijden onbekend</span>`;
}

function makePopupHtml(item) {
  return `
    <div class="popup-name">${escHtml(item.name)}</div>
    <div class="popup-type">${item.catInfo.icon} ${item.catInfo.label}</div>
    <div class="popup-open">${item.openStatus === 'open' ? '🟢 Open' : item.openStatus === 'closed' ? '🔴 Gesloten' : ''}</div>
    <div style="margin-top:4px;font-size:11px;color:#64748b">📍 ${formatDist(item.dist)}</div>
  `;
}

function makeLeafletIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:#2563eb;border:2px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,.3);
      transform:rotate(-45deg);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function showToast(msg, duration = 3000) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.add('hidden'), duration);
}

// ── Boot ───────────────────────────────────────────────────
initMap();
initUI();
