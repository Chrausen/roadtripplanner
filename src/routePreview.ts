import type { Coordinates } from './types'

export function buildRoutePreviewPath(
  geometry: Coordinates[],
  width = 120,
  height = 60,
  pad = 6
): string {
  if (geometry.length < 2) return ''
  const lats = geometry.map((p) => p.lat)
  const lngs = geometry.map((p) => p.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const spanLat = maxLat - minLat || 1
  const spanLng = maxLng - minLng || 1
  const innerW = width - pad * 2
  const innerH = height - pad * 2

  const points = geometry.map((p) => {
    const x = pad + ((p.lng - minLng) / spanLng) * innerW
    const y = pad + innerH - ((p.lat - minLat) / spanLat) * innerH
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return `M${points.join(' L')}`
}
