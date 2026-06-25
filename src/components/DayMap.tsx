import { useEffect, useMemo, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import type { Day, Coordinates, PlaceType, ActivityType } from '../types'
import { useTripStore } from '../store'
import { fetchOsrmRoute, formatDuration } from '../api'

const PLACE_COLORS: Record<PlaceType, string> = {
  sight: '#2f6b52',
  nature: '#3a7d44',
  city: '#5b4636',
  beach: '#1f7a8c',
  museum: '#6b4329',
  viewpoint: '#8a5a3c',
  village: '#9c6644',
  other: '#555555',
}

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  activity: '#b23b3b',
  meal: '#c97b3d',
  cafe: '#a8763e',
  accommodation: '#5c4d7d',
  shopping: '#a23b8f',
  other: '#777777',
}

const ROUTE_PALETTE = ['#8a5a3c', '#2f6b52', '#b23b3b', '#2f5b8c', '#7d3a8a']

function dotIcon(color: string) {
  return L.divIcon({
    className: 'pin-icon',
    html: `<span style="background:${color}" class="pin-dot"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

function endpointIcon(label: string) {
  return L.divIcon({
    className: 'endpoint-icon',
    html: `<span class="endpoint-marker">${label}</span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

interface MapPoint {
  id: string
  coords: Coordinates
  name: string
  notes: string
  color: string
}

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    const bounds = L.latLngBounds(points.map((p) => [p.coords.lat, p.coords.lng]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
  }, [points, map])
  return null
}

function RouteDrawing({ day }: { day: Day }) {
  const [pendingStart, setPendingStart] = useState<Coordinates | null>(null)
  const addMapRoute = useTripStore((s) => s.addMapRoute)

  useMapEvents({
    contextmenu(e) {
      const clicked = { lat: e.latlng.lat, lng: e.latlng.lng }
      if (!pendingStart) {
        setPendingStart(clicked)
      } else {
        const start = pendingStart
        setPendingStart(null)
        fetchOsrmRoute(start, clicked).then((result) => {
          if (!result) return
          addMapRoute(day.id, {
            start,
            end: clicked,
            geometry: result.geometry,
            durationSeconds: result.durationSeconds,
            distanceKm: result.distanceKm,
          })
        })
      }
    },
  })

  if (!pendingStart) return null
  return <Marker position={[pendingStart.lat, pendingStart.lng]} icon={endpointIcon('A')} />
}

function ClickToAdd({
  active,
  onPick,
}: {
  active: boolean
  onPick: (coords: Coordinates) => void
}) {
  useMapEvents({
    click(e) {
      if (!active) return
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

export function DayMap({ day }: { day: Day }) {
  const deleteMapRoute = useTripStore((s) => s.deleteMapRoute)
  const addPlace = useTripStore((s) => s.addPlace)
  const addActivity = useTripStore((s) => s.addActivity)
  const [addMode, setAddMode] = useState(false)
  const [pickedCoords, setPickedCoords] = useState<Coordinates | null>(null)
  const [newName, setNewName] = useState('')
  const [newKind, setNewKind] = useState<'place' | 'activity'>('place')

  const points: MapPoint[] = useMemo(() => {
    const placePoints = day.places
      .filter((p) => p.coords)
      .map((p) => ({
        id: p.id,
        coords: p.coords!,
        name: p.name || 'Untitled place',
        notes: p.notes,
        color: PLACE_COLORS[p.type],
      }))
    const activityPoints = day.activities
      .filter((a) => a.coords)
      .map((a) => ({
        id: a.id,
        coords: a.coords!,
        name: a.name || 'Untitled activity',
        notes: a.notes,
        color: ACTIVITY_COLORS[a.type],
      }))
    return [...placePoints, ...activityPoints]
  }, [day.places, day.activities])

  function confirmAdd() {
    if (!pickedCoords) return
    if (newKind === 'place') {
      addPlace(day.id, { name: newName, type: 'sight', notes: '', coords: pickedCoords })
    } else {
      addActivity(day.id, {
        name: newName,
        type: 'activity',
        time: '',
        notes: '',
        coords: pickedCoords,
      })
    }
    setPickedCoords(null)
    setNewName('')
  }

  return (
    <div className="day-map-wrap">
      <div className="map-toolbar">
        <button
          className={addMode ? 'btn-primary' : 'btn-secondary'}
          onClick={() => {
            setAddMode((v) => !v)
            setPickedCoords(null)
          }}
        >
          {addMode ? 'Click map to add pin…' : 'Click to add mode'}
        </button>
        <span className="map-hint mono">Right-click: start/end a driving route</span>
      </div>

      {pickedCoords && (
        <div className="add-pin-form">
          <input
            placeholder="Name this location"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <select value={newKind} onChange={(e) => setNewKind(e.target.value as any)}>
            <option value="place">Place to visit</option>
            <option value="activity">Activity / meal</option>
          </select>
          <button className="btn-primary" onClick={confirmAdd} disabled={!newName.trim()}>
            Add
          </button>
          <button className="btn-ghost" onClick={() => setPickedCoords(null)}>
            Cancel
          </button>
        </div>
      )}

      <MapContainer
        center={[48.0, 10.0]}
        zoom={5}
        className="day-map"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors, tiles by Humanitarian OSM Team'
          url="https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          subdomains={['a', 'b']}
        />
        <FitBounds points={points} />
        <ClickToAdd active={addMode} onPick={setPickedCoords} />
        <RouteDrawing day={day} />

        {points.map((p) => (
          <Marker key={p.id} position={[p.coords.lat, p.coords.lng]} icon={dotIcon(p.color)}>
            <Popup>
              <strong>{p.name}</strong>
              {p.notes && <p>{p.notes}</p>}
            </Popup>
          </Marker>
        ))}

        {pickedCoords && (
          <Marker position={[pickedCoords.lat, pickedCoords.lng]} icon={endpointIcon('+')} />
        )}

        {day.mapRoutes.map((route, i) => {
          const color = ROUTE_PALETTE[i % ROUTE_PALETTE.length]
          const latlngs = route.geometry.map((c) => [c.lat, c.lng]) as [number, number][]
          return (
            <span key={route.id}>
              <Polyline positions={latlngs} pathOptions={{ color, weight: 4, dashArray: i % 2 ? '8 6' : undefined }}>
                <Tooltip permanent direction="center" className="route-label mono">
                  {formatDuration(route.durationSeconds)} · {route.distanceKm.toFixed(1)} km
                </Tooltip>
              </Polyline>
              <Marker position={[route.start.lat, route.start.lng]} icon={endpointIcon('A')} />
              <Marker position={[route.end.lat, route.end.lng]} icon={endpointIcon('B')}>
                <Popup>
                  <button className="btn-danger" onClick={() => deleteMapRoute(day.id, route.id)}>
                    Delete this route
                  </button>
                </Popup>
              </Marker>
            </span>
          )
        })}
      </MapContainer>

      {day.mapRoutes.length > 0 && (
        <ul className="route-list">
          {day.mapRoutes.map((route, i) => (
            <li key={route.id} className="route-list-item">
              <span
                className="route-swatch"
                style={{ background: ROUTE_PALETTE[i % ROUTE_PALETTE.length] }}
              />
              <span className="mono">
                {formatDuration(route.durationSeconds)} · {route.distanceKm.toFixed(1)} km
              </span>
              <button className="btn-danger" onClick={() => deleteMapRoute(day.id, route.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
