# Road Trip Planner

A travel-notebook styled PWA for planning multi-day road trips. All data lives in the browser's localStorage — no backend, no login, no sync.

## Features

- One active trip with a name and description
- Any number of days, each with route, places to visit, activities & meals, and a map
- Map pins via Nominatim search or click-to-add, color-coded by category
- Multi-segment driving routes drawn via right-click, routed with OSRM (duration + distance labels)
- Installable, offline-capable PWA
- Responsive layout: sidebar + map on the right on wide desktop screens, stacked day strip on mobile

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
