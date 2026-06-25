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
import { fetchOsrmRoute, formatDuration, reverseGeocode } from '../api'

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

const BERLIN: Coordinates = { lat: 52.52, lng: 13.405 }
// Roughly shows a 100km radius around the center point.
const DEFAULT_ZOOM = 9
// Roughly shows a 10km radius around the center point.
const FOCUS_ZOOM = 12

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

function FitBounds({
  points,
  routeEndpoints,
}: {
  points: MapPoint[]
  routeEndpoints: Coordinates[]
}) {
  const map = useMap()

  useEffect(() => {
    const all = [...points.map((p) => p.coords), ...routeEndpoints]
    if (all.length === 0) {
      let cancelled = false
      const applyDefault = (center: Coordinates) => {
        if (!cancelled) map.setView([center.lat, center.lng], DEFAULT_ZOOM)
      }
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => applyDefault({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => applyDefault(BERLIN),
          { timeout: 5000 }
        )
      } else {
        applyDefault(BERLIN)
      }
      return () => {
        cancelled = true
      }
    }

    const bounds = L.latLngBounds(all.map((c) => [c.lat, c.lng]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
  }, [points, routeEndpoints, map])

  return null
}

function FocusHandler({
  focusRequest,
}: {
  focusRequest: { coords: Coordinates; id: number } | null
}) {
  const map = useMap()

  useEffect(() => {
    if (!focusRequest) return
    map.setView([focusRequest.coords.lat, focusRequest.coords.lng], FOCUS_ZOOM)
  }, [focusRequest, map])

  return null
}

interface MapMenuState {
  coords: Coordinates
  point: { x: number; y: number }
}

function MapContextMenu({
  onOpen,
  onClose,
}: {
  onOpen: (coords: Coordinates, point: { x: number; y: number }) => void
  onClose: () => void
}) {
  useMapEvents({
    contextmenu(e) {
      onOpen({ lat: e.latlng.lat, lng: e.latlng.lng }, e.containerPoint)
    },
    click() {
      onClose()
    },
    movestart() {
      onClose()
    },
  })
  return null
}

function RadialMapMenu({
  menu,
  canEndRoute,
  onStartRoute,
  onEndRoute,
  onPlacePin,
}: {
  menu: MapMenuState
  canEndRoute: boolean
  onStartRoute: () => void
  onEndRoute: () => void
  onPlacePin: () => void
}) {
  const options = [
    { label: 'Start route here', onClick: onStartRoute, disabled: false },
    { label: 'End route here', onClick: onEndRoute, disabled: !canEndRoute },
    { label: 'Place a pin', onClick: onPlacePin, disabled: false },
  ]
  const radius = 64
  return (
    <div
      className="radial-menu"
      style={{ left: menu.point.x, top: menu.point.y }}
    >
      <span className="radial-menu-center" />
      {options.map((opt, i) => {
        const angle = (-90 + (360 / options.length) * i) * (Math.PI / 180)
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        return (
          <button
            key={opt.label}
            type="button"
            className="radial-menu-option"
            style={{ transform: `translate(${x}px, ${y}px) translate(-50%, -50%)` }}
            disabled={opt.disabled}
            onClick={opt.onClick}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
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
  const deleteRoute = useTripStore((s) => s.deleteRoute)
  const addRoute = useTripStore((s) => s.addRoute)
  const addPlace = useTripStore((s) => s.addPlace)
  const addActivity = useTripStore((s) => s.addActivity)
  const focusRequest = useTripStore((s) => s.focusRequest)
  const [addMode, setAddMode] = useState(false)
  const [pickedCoords, setPickedCoords] = useState<Coordinates | null>(null)
  const [newName, setNewName] = useState('')
  const [newKind, setNewKind] = useState<'place' | 'activity'>('place')
  const [pendingStart, setPendingStart] = useState<Coordinates | null>(null)
  const [menu, setMenu] = useState<MapMenuState | null>(null)

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

  const drawnRoutes = useMemo(
    () => day.routes.filter((r) => r.geometry.length > 1 && r.fromCoords && r.toCoords),
    [day.routes]
  )

  const routeEndpoints = useMemo(
    () => drawnRoutes.flatMap((r) => [r.fromCoords!, r.toCoords!]),
    [drawnRoutes]
  )

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

  function handleStartRoute() {
    if (!menu) return
    setPendingStart(menu.coords)
    setMenu(null)
  }

  function handleEndRoute() {
    if (!menu || !pendingStart) return
    const start = pendingStart
    const end = menu.coords
    setPendingStart(null)
    setMenu(null)
    Promise.all([
      fetchOsrmRoute(start, end),
      reverseGeocode(start),
      reverseGeocode(end),
    ]).then(([result, fromName, toName]) => {
      if (!result) return
      addRoute(day.id, {
        from: fromName,
        to: toName,
        fromCoords: start,
        toCoords: end,
        notes: '',
        geometry: result.geometry,
        durationSeconds: result.durationSeconds,
        distanceKm: result.distanceKm,
      })
    })
  }

  function handlePlacePin() {
    if (!menu) return
    setPickedCoords(menu.coords)
    setMenu(null)
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
        <span className="map-hint mono">Right-click: open the route/pin menu</span>
      </div>

      {pickedCoords && (
        <div className="add-pin-form">
          <input
            placeholder="Name this location"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <select value={newKind} onChange={(e) => setNewKind(e.target.value as 'place' | 'activity')}>
            <option value="place">Place to visit</option>
            <option value="activity">Meal</option>
          </select>
          <button className="btn-primary" onClick={confirmAdd} disabled={!newName.trim()}>
            Add
          </button>
          <button className="btn-ghost" onClick={() => setPickedCoords(null)}>
            Cancel
          </button>
        </div>
      )}

      <div className="day-map-container">
        <MapContainer center={[BERLIN.lat, BERLIN.lng]} zoom={DEFAULT_ZOOM} className="day-map" scrollWheelZoom>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors, tiles by Humanitarian OSM Team'
            url="https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            subdomains={['a', 'b']}
          />
          <FitBounds points={points} routeEndpoints={routeEndpoints} />
          <FocusHandler focusRequest={focusRequest} />
          <ClickToAdd active={addMode} onPick={setPickedCoords} />
          <MapContextMenu onOpen={(coords, point) => setMenu({ coords, point })} onClose={() => setMenu(null)} />

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

          {pendingStart && (
            <Marker position={[pendingStart.lat, pendingStart.lng]} icon={endpointIcon('A')} />
          )}

        {drawnRoutes.map((route, i) => {
          const color = ROUTE_PALETTE[i % ROUTE_PALETTE.length]
          const latlngs = route.geometry.map((c) => [c.lat, c.lng]) as [number, number][]
          return (
            <span key={route.id}>
              <Polyline
                positions={latlngs}
                pathOptions={{ color, weight: 4, dashArray: i % 2 ? '8 6' : undefined }}
              >
                <Tooltip permanent direction="center" className="route-label mono">
                  {route.durationSeconds != null && formatDuration(route.durationSeconds)}
                  {route.distanceKm != null && ` · ${route.distanceKm.toFixed(1)} km`}
                </Tooltip>
              </Polyline>
              <Marker position={[route.fromCoords!.lat, route.fromCoords!.lng]} icon={endpointIcon('A')} />
              <Marker position={[route.toCoords!.lat, route.toCoords!.lng]} icon={endpointIcon('B')}>
                <Popup>
                  <button className="btn-danger" onClick={() => deleteRoute(day.id, route.id)}>
                    Delete this route
                  </button>
                </Popup>
              </Marker>
            </span>
          )
        })}
        </MapContainer>

        {menu && (
          <RadialMapMenu
            menu={menu}
            canEndRoute={!!pendingStart}
            onStartRoute={handleStartRoute}
            onEndRoute={handleEndRoute}
            onPlacePin={handlePlacePin}
          />
        )}
      </div>
    </div>
  )
}
