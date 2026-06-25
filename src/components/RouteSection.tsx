import { useState } from 'react'
import { useTripStore } from '../store'
import type { Day, RouteEntry } from '../types'
import { AddressSearchInput } from './AddressSearchInput'
import { formatDuration } from '../api'
import { buildRoutePreviewPath } from '../routePreview'

function RoutePreview({ route }: { route: RouteEntry }) {
  if (route.geometry.length < 2) {
    return <div className="route-preview route-preview-empty mono">no path drawn</div>
  }
  const path = buildRoutePreviewPath(route.geometry)
  return (
    <svg className="route-preview" viewBox="0 0 120 60" width={120} height={60}>
      <path d={path} fill="none" stroke="#8a5a3c" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  )
}

function RouteCard({ day, route }: { day: Day; route: RouteEntry }) {
  const updateRoute = useTripStore((s) => s.updateRoute)
  const deleteRoute = useTripStore((s) => s.deleteRoute)
  const [expanded, setExpanded] = useState(!route.from && !route.to)

  if (!expanded) {
    return (
      <li className="route-card route-card-collapsed">
        <RoutePreview route={route} />
        <div className="route-card-summary">
          <strong>
            {route.from || 'Start'} → {route.to || 'End'}
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
          <button className="btn-secondary" onClick={() => setExpanded(true)}>
            Edit
          </button>
          <button className="btn-danger" onClick={() => deleteRoute(day.id, route.id)}>
            Delete
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
