import type { Coordinates } from './types'

export interface GeocodeResult {
  name: string
  lat: number
  lng: number
}

export async function geocodeSearch(query: string): Promise<GeocodeResult[]> {
  if (!query.trim()) return []
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}&limit=5`
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.map((d: { display_name: string; lat: string; lon: string }) => ({
    name: d.display_name,
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
  }))
}

export async function reverseGeocode(coords: Coordinates): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return ''
  const data = await res.json()
  return data.display_name ?? ''
}

export interface OsrmRouteResult {
  geometry: Coordinates[]
  durationSeconds: number
  distanceKm: number
}

export async function fetchOsrmRoute(
  start: Coordinates,
  end: Coordinates
): Promise<OsrmRouteResult | null> {
  const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  const route = data.routes?.[0]
  if (!route) return null
  const geometry: Coordinates[] = route.geometry.coordinates.map(
    ([lng, lat]: [number, number]) => ({ lat, lng })
  )
  return {
    geometry,
    durationSeconds: route.duration,
    distanceKm: route.distance / 1000,
  }
}

export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `~${minutes}min`
  if (minutes === 0) return `~${hours}h`
  return `~${hours}h ${minutes}min`
}
