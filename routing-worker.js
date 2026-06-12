'use strict';
/* ============================================================
   bereik. — routing-worker.js
   Custom isochrone engine: OSM road network + Dijkstra
   Runs in a Web Worker so the main thread stays responsive.
   ============================================================ */

// ── Realistic speed model (km/h per highway type) ─────────────────────────
const SPEEDS = {
  driving: {
    motorway: 110, motorway_link: 70, trunk: 90, trunk_link: 60,
    primary: 70, primary_link: 50, secondary: 55, secondary_link: 45,
    tertiary: 45, tertiary_link: 35, residential: 30, living_street: 15,
    service: 20, unclassified: 40, road: 35,
  },
  cycling: {
    cycleway: 22, path: 12, footway: 7, pedestrian: 7, living_street: 12,
    residential: 16, service: 12, tertiary: 16, tertiary_link: 14,
    secondary: 14, unclassified: 14, primary: 12, track: 10,
  },
  walking: {
    footway: 5, path: 4, pedestrian: 4, steps: 1, living_street: 5,
    residential: 5, service: 4, tertiary: 5, unclassified: 4, track: 3,
  },
};

// ── Geometry helpers ──────────────────────────────────────────────────────
const toRad = d => d * Math.PI / 180;
function haversineKm(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Min-heap (Dijkstra priority queue) ───────────────────────────────────
class MinHeap {
  constructor() { this._h = []; }
  push(item) { this._h.push(item); this._up(this._h.length - 1); }
  pop() {
    if (!this._h.length) return null;
    const top = this._h[0];
    const last = this._h.pop();
    if (this._h.length) { this._h[0] = last; this._down(0); }
    return top;
  }
  get size() { return this._h.length; }
  _up(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this._h[p].t <= this._h[i].t) break;
      [this._h[p], this._h[i]] = [this._h[i], this._h[p]]; i = p;
    }
  }
  _down(i) {
    const n = this._h.length;
    for (;;) {
      let m = i, l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this._h[l].t < this._h[m].t) m = l;
      if (r < n && this._h[r].t < this._h[m].t) m = r;
      if (m === i) break;
      [this._h[m], this._h[i]] = [this._h[i], this._h[m]]; i = m;
    }
  }
}

// ── Graph construction from Overpass way elements ─────────────────────────
function nk(lat, lon) { return `${lat.toFixed(5)},${lon.toFixed(5)}`; }

function buildGraph(ways, mode) {
  const table  = SPEEDS[mode] || SPEEDS.driving;
  const adj    = new Map();   // nodeKey → [{key,lat,lon,t}]
  const pos    = new Map();   // nodeKey → {lat,lon}

  for (const way of ways) {
    const tags   = way.tags  || {};
    const hw     = tags.highway || '';
    let   speed  = table[hw];
    if (!speed) continue;

    // Honour maxspeed tag when available
    if (mode === 'driving' && tags.maxspeed) {
      const ms = parseInt(tags.maxspeed, 10);
      if (!isNaN(ms) && ms > 0) speed = Math.min(ms, 130);
    }

    const geom   = way.geometry || [];
    const oneway = tags.oneway === 'yes' || tags.oneway === '1';

    for (const { lat, lon } of geom) {
      const k = nk(lat, lon);
      if (!pos.has(k)) pos.set(k, { lat, lon });
    }
    for (let i = 0; i < geom.length - 1; i++) {
      const a = geom[i], b = geom[i + 1];
      const ka = nk(a.lat, a.lon), kb = nk(b.lat, b.lon);
      const t  = (haversineKm(a.lat, a.lon, b.lat, b.lon) / speed) * 3600;
      if (!adj.has(ka)) adj.set(ka, []);
      if (!adj.has(kb)) adj.set(kb, []);
      adj.get(ka).push({ key: kb, lat: b.lat, lon: b.lon, t });
      if (!oneway) adj.get(kb).push({ key: ka, lat: a.lat, lon: a.lon, t });
    }
  }
  return { adj, pos };
}

// ── Snap start location to nearest road node ──────────────────────────────
function snap(lat, lon, pos) {
  let best = null, bd = Infinity;
  // Fast pre-filter: only check nodes within 10 km
  const dLat = 10 / 111;
  const dLon = 10 / (111 * Math.cos(lat * Math.PI / 180));
  for (const [k, p] of pos) {
    if (Math.abs(p.lat - lat) > dLat || Math.abs(p.lon - lon) > dLon) continue;
    const d = haversineKm(lat, lon, p.lat, p.lon);
    if (d < bd) { bd = d; best = k; }
  }
  if (!best) { // wider fallback (e.g. islands or sparse network)
    for (const [k, p] of pos) {
      const d = haversineKm(lat, lon, p.lat, p.lon);
      if (d < bd) { bd = d; best = k; }
    }
  }
  return best;
}

// ── Dijkstra ──────────────────────────────────────────────────────────────
function dijkstra(adj, startKey, budgetSec) {
  const dist = new Map();
  const heap = new MinHeap();
  dist.set(startKey, 0);
  heap.push({ t: 0, key: startKey });

  while (heap.size) {
    const { t, key } = heap.pop();
    if (t > (dist.get(key) ?? Infinity)) continue; // stale
    if (t > budgetSec) continue;                    // over budget

    for (const { key: nk, t: et } of (adj.get(key) || [])) {
      const nt = t + et;
      if (nt < (dist.get(nk) ?? Infinity)) {
        dist.set(nk, nt);
        heap.push({ t: nt, key: nk });
      }
    }
  }
  return dist;
}

// ── Isochrone polygon extraction ──────────────────────────────────────────
// Strategy: find all edges that cross the time budget, interpolate exact
// boundary points on those edges, then order by angle for a closed polygon.
function extractIsochrone(dist, pos, adj, budgetSec) {
  const boundary = [];
  const seen     = new Set();

  for (const [key, t] of dist) {
    if (t > budgetSec) continue;
    const p = pos.get(key);
    if (!p) continue;

    for (const { key: nk, lat: nl, lon: nlo, t: et } of (adj.get(key) || [])) {
      const nt = t + et;
      if (nt > budgetSec) {
        // Interpolate where on this edge the budget is reached
        const frac = (budgetSec - t) / et;
        const bLat = p.lat + frac * (nl  - p.lat);
        const bLon = p.lon + frac * (nlo - p.lon);
        const bk   = `${bLat.toFixed(5)},${bLon.toFixed(5)}`;
        if (!seen.has(bk)) { seen.add(bk); boundary.push([bLon, bLat]); }
      }
    }
  }

  if (boundary.length < 8) return null;

  // Deduplicate spatially close points (grid ~500m)
  const deduped = [];
  const usedGrid = new Set();
  for (const [lon, lat] of boundary) {
    const gk = `${(lat * 100).toFixed(0)},${(lon * 100).toFixed(0)}`;
    if (!usedGrid.has(gk)) { usedGrid.add(gk); deduped.push([lon, lat]); }
  }

  // Sort by angle from centroid → closed polygon
  const cLon = deduped.reduce((s, p) => s + p[0], 0) / deduped.length;
  const cLat = deduped.reduce((s, p) => s + p[1], 0) / deduped.length;
  deduped.sort((a, b) =>
    Math.atan2(a[1] - cLat, a[0] - cLon) - Math.atan2(b[1] - cLat, b[0] - cLon)
  );

  return deduped; // [[lon, lat], …]
}

// ── Worker entry point ────────────────────────────────────────────────────
self.onmessage = function ({ data }) {
  const { id, ways, lat, lon, budgetMin, mode } = data;
  const budgetSec = budgetMin * 60;
  try {
    self.postMessage({ id, phase: 'graph' });
    const { adj, pos } = buildGraph(ways, mode);
    if (!pos.size) throw new Error('Empty road network');

    self.postMessage({ id, phase: 'dijkstra', nodes: pos.size });
    const startKey = snap(lat, lon, pos);
    if (!startKey) throw new Error('No road near start location');
    const dist = dijkstra(adj, startKey, budgetSec);

    self.postMessage({ id, phase: 'isochrone' });
    const ring = extractIsochrone(dist, pos, adj, budgetSec);
    if (!ring) throw new Error('Insufficient boundary points');

    self.postMessage({ id, ring });
  } catch (err) {
    self.postMessage({ id, error: err.message });
  }
};
