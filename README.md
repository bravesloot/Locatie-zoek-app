# Locatie Zoeker / Location Finder

Een webapplicatie waarmee je op basis van reistijd ontdekt wat er in de buurt is — voor uitstapjes, eten & drinken én overnachtingen.

> A web application that lets you discover what's nearby based on travel time — for day trips, food & drinks, and overnight stays.

---

## 🇳🇱 Nederlands

### Wat is dit?

Locatie Zoeker is een gratis, advertentievrije webapp die op basis van jouw reistijd laat zien welke locaties bereikbaar zijn. De app tekent een echte reistijdpolygoon op de kaart (gebaseerd op het wegennetwerk, niet een simpele cirkel) en toont vervolgens alle relevante plekken daarbinnen.

### Functies

- **Echte isochrone** — polygoon gebaseerd op het wegennetwerk via Valhalla, niet een simpele cirkel
- **Dubbele slider** — stel een minimum én maximum reistijd in (donut-weergave op de kaart)
- **Vervoersmiddel** — auto, fiets of te voet
- **GPS of adres** — gebruik je huidige locatie of typ een adres met autocomplete
- **Activiteiten** — zoek op koffie, restaurant, bar, museum, park, wandelroutes, supermarkt, bibliotheek, bioscoop, bakkerij, fastfood of speeltuin (meerdere tegelijk)
- **Overnachten** — zoek campings, hotels/B&B's of vakantiehuizen met uitgebreide filters (elektra, huisdieren, zwembad, WiFi, sterren, capaciteit, etc.)
- **Nu geopend** — filter alleen locaties die op dit moment open zijn
- **Sorteren** — op afstand, beoordeling of naam
- **Verras me** — laat de app een willekeurige locatie kiezen
- **Favorieten** — bewaar je favoriete plekken (opgeslagen in de browser)
- **Deel-knop** — kopieer een link die je zoekopdracht vastlegt
- **Dark mode** — schakel over naar donker thema
- **NL/EN** — meertalige interface, taal wordt automatisch gedetecteerd
- **Boekingslinks** — directe links naar Booking.com, Airbnb en ANWB Camping

### Hoe te gebruiken

1. Open `index.html` in een moderne browser (of via GitHub Pages)
2. Voer je locatie in of klik op het GPS-icoontje
3. Kies je vervoersmiddel en stel de gewenste reistijd in
4. Kies wat je zoekt (activiteiten of overnachten)
5. Klik op **Zoeken**

### Technologie

| Component | Wat |
|-----------|-----|
| [Leaflet.js](https://leafletjs.com/) | Interactieve kaart |
| [OpenStreetMap](https://www.openstreetmap.org/) | Kaartdata |
| [Valhalla](https://valhalla.openstreetmap.de/) | Isochrone berekening (reistijdpolygoon) |
| [Overpass API](https://overpass-api.de/) | POI-data (openbare plaatsen) |
| [Nominatim](https://nominatim.org/) | Geocoding & adresautocomplete |

Geen API-sleutels nodig. Geen backend. Volledig statisch — gewoon een HTML-bestand openen volstaat.

### Installatie

```bash
git clone https://github.com/bravesloot/locatie-zoek-app.git
cd locatie-zoek-app
# Open index.html in een browser — klaar!
```

Of gebruik [GitHub Pages](https://pages.github.com/) om de app online te hosten.

### Gegevensbronnen

- Kaartdata: © [OpenStreetMap](https://www.openstreetmap.org/copyright) bijdragers (ODbL)
- Isochrone: [Valhalla](https://valhalla.openstreetmap.de/) (MIT)
- POI-data: [Overpass API](https://overpass-api.de/) (CC0)
- Geocoding: [Nominatim](https://nominatim.org/) (ODbL)

### Licentie

MIT — doe er mee wat je wilt.

---

## 🇬🇧 English

### What is this?

Location Finder is a free, ad-free web app that shows you what's reachable based on your travel time. The app draws a real travel-time polygon on the map (based on the road network, not a simple circle) and then displays all relevant places within it.

### Features

- **Real isochrone** — polygon based on the actual road network via Valhalla, not a simple circle
- **Dual range slider** — set a minimum and maximum travel time (donut view on the map)
- **Transport mode** — car, bicycle or walking
- **GPS or address** — use your current location or type an address with autocomplete
- **Activities** — search for coffee, restaurant, bar, museum, park, hiking, supermarket, library, cinema, bakery, fast food or playground (multiple at once)
- **Overnight stays** — search for campsites, hotels/B&Bs or holiday homes with extensive filters (electricity, pets, pool, WiFi, stars, capacity, etc.)
- **Open now** — filter to only places currently open
- **Sort** — by distance, rating or name
- **Surprise me** — let the app pick a random place for you
- **Favorites** — save your favourite places (stored in your browser)
- **Share button** — copy a link that captures your current search
- **Dark mode** — toggle dark theme
- **NL/EN** — multilingual interface, language auto-detected
- **Booking links** — direct links to Booking.com, Airbnb and ANWB Camping

### How to use

1. Open `index.html` in a modern browser (or via GitHub Pages)
2. Enter your location or click the GPS icon
3. Choose your transport mode and set your desired travel time
4. Select what you're looking for (activities or overnight stays)
5. Click **Search**

### Technology

| Component | What |
|-----------|------|
| [Leaflet.js](https://leafletjs.com/) | Interactive map |
| [OpenStreetMap](https://www.openstreetmap.org/) | Map data |
| [Valhalla](https://valhalla.openstreetmap.de/) | Isochrone calculation (travel time polygon) |
| [Overpass API](https://overpass-api.de/) | POI data (public places) |
| [Nominatim](https://nominatim.org/) | Geocoding & address autocomplete |

No API keys needed. No backend. Fully static — just open the HTML file.

### Installation

```bash
git clone https://github.com/bravesloot/locatie-zoek-app.git
cd locatie-zoek-app
# Open index.html in a browser — done!
```

Or use [GitHub Pages](https://pages.github.com/) to host the app online.

### Data sources

- Map data: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors (ODbL)
- Isochrone: [Valhalla](https://valhalla.openstreetmap.de/) (MIT)
- POI data: [Overpass API](https://overpass-api.de/) (CC0)
- Geocoding: [Nominatim](https://nominatim.org/) (ODbL)

### License

MIT — do whatever you want with it.
