import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useTripStore } from '../store'
import type { Day, RouteEntry } from '../types'
import { AddressSearchInput } from './AddressSearchInput'
import { fetchOsrmRoute, formatDuration } from '../api'

function FitRoute({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(L.latLngBounds(positions), { padding: [6, 6] })
  }, [positions, map])
  return null
}

function RoutePreview({ route }: { route: RouteEntry }) {
  if (route.geometry.length < 2) {
    return <div className="route-preview route-preview-empty mono">no path drawn</div>
  }
  const positions = route.geometry.map((c) => [c.lat, c.lng]) as [number, number][]
  return (
    <MapContainer
      className="route-preview route-preview-map"
      center={positions[0]}
      zoom={9}
      dragging={false}
      zoomControl={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      attributionControl={false}
      touchZoom={false}
      boxZoom={false}
      keyboard={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
        subdomains={['a', 'b', 'c', 'd']}
        crossOrigin="anonymous"
      />
      <FitRoute positions={positions} />
      <Polyline positions={positions} pathOptions={{ color: '#1a73e8', weight: 2.5 }} />
    </MapContainer>
  )
}

function RouteCard({ day, route }: { day: Day; route: RouteEntry }) {
  const updateRoute = useTripStore((s) => s.updateRoute)
  const deleteRoute = useTripStore((s) => s.deleteRoute)
  const focusOnMap = useTripStore((s) => s.focusOnMap)
  const [expanded, setExpanded] = useState(!route.from && !route.to)

  useEffect(() => {
    if (route.fromCoords && route.toCoords && route.geometry.length < 2) {
      fetchOsrmRoute(route.fromCoords, route.toCoords).then((result) => {
        if (!result) return
        updateRoute(day.id, route.id, {
          geometry: result.geometry,
          durationSeconds: result.durationSeconds,
          distanceKm: result.distanceKm,
        })
      })
    }
  }, [route.fromCoords, route.toCoords, route.geometry.length, day.id, route.id, updateRoute])

  if (!expanded) {
    return (
      <li className="route-card route-card-collapsed">
        <RoutePreview route={route} />
        <div className="route-card-summary">
          <strong>
            <button
              type="button"
              className="btn-link"
              disabled={!route.fromCoords}
              title={route.from || undefined}
              onClick={() => route.fromCoords && focusOnMap(route.fromCoords)}
            >
              Start
            </button>
            {' → '}
            <button
              type="button"
              className="btn-link"
              disabled={!route.toCoords}
              title={route.to || undefined}
              onClick={() => route.toCoords && focusOnMap(route.toCoords)}
            >
              End
            </button>
          </strong>
          {(route.durationSeconds != null || route.distanceKm != null) && (
            <span className="mono route-card-meta">
              {route.durationSeconds != null && formatDuration(route.durationSeconds)}
              {route.durationSeconds != null && route.distanceKm != null && ' · '}
              {route.distanceKm != null && `${route.distanceKm.toFixed(1)} km`}
            </span>
          )}
          {route.notes && <p className="route-card-notes">{route.notes}</p>}
        </div>
        <div className="route-card-actions">
          <button
            type="button"
            className="btn-icon"
            title="Edit route"
            aria-label="Edit route"
            onClick={() => setExpanded(true)}
          >
            ✏️
          </button>
        </div>
      </li>
    )
  }

  return (
    <li className="route-card route-card-expanded">
      <div className="route-grid">
        <div>
          <label htmlFor={`from-${route.id}`}>From</label>
          <AddressSearchInput
            value={route.from}
            coords={route.fromCoords}
            placeholder="Search an address…"
            onChange={(value, coords) =>
              updateRoute(day.id, route.id, {
                from: value,
                fromCoords: coords ?? route.fromCoords,
              })
            }
          />
        </div>
        <div>
          <label htmlFor={`to-${route.id}`}>To</label>
          <AddressSearchInput
            value={route.to}
            coords={route.toCoords}
            placeholder="Search an address…"
            onChange={(value, coords) =>
              updateRoute(day.id, route.id, {
                to: value,
                toCoords: coords ?? route.toCoords,
              })
            }
          />
        </div>
      </div>
      <label htmlFor={`notes-${route.id}`}>Notes</label>
      <textarea
        id={`notes-${route.id}`}
        rows={2}
        placeholder="Which roads, notable stops along the way…"
        value={route.notes}
        onChange={(e) => updateRoute(day.id, route.id, { notes: e.target.value })}
      />
      <div className="route-card-actions">
        <button className="btn-secondary" onClick={() => setExpanded(false)}>
          Done
        </button>
        <button className="btn-danger" onClick={() => deleteRoute(day.id, route.id)}>
          Delete
        </button>
      </div>
    </li>
  )
}

export function RouteSection({ day }: { day: Day }) {
  const addRoute = useTripStore((s) => s.addRoute)

  return (
    <section className="card">
      <h2>Route</h2>
      {day.routes.length > 0 && (
        <ul className="route-card-list">
          {day.routes.map((route) => (
            <RouteCard key={route.id} day={day} route={route} />
          ))}
        </ul>
      )}
      <button
        className="btn-primary"
        onClick={() =>
          addRoute(day.id, {
            from: '',
            to: '',
            fromCoords: null,
            toCoords: null,
            notes: '',
            geometry: [],
            durationSeconds: null,
            distanceKm: null,
          })
        }
      >
        + Add route
      </button>
    </section>
  )
}
