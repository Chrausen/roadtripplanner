import { useTripStore } from '../store'
import type { Day } from '../types'

export function RouteSection({ day }: { day: Day }) {
  const updateRoute = useTripStore((s) => s.updateRoute)

  return (
    <section className="card">
      <h2>Route</h2>
      <div className="route-grid">
        <div>
          <label htmlFor="route-from">From</label>
          <input
            id="route-from"
            value={day.route.from}
            onChange={(e) => updateRoute(day.id, { ...day.route, from: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="route-to">To</label>
          <input
            id="route-to"
            value={day.route.to}
            onChange={(e) => updateRoute(day.id, { ...day.route, to: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="route-distance">Distance (km)</label>
          <input
            id="route-distance"
            className="mono"
            type="number"
            value={day.route.distanceKm ?? ''}
            onChange={(e) =>
              updateRoute(day.id, {
                ...day.route,
                distanceKm: e.target.value === '' ? null : Number(e.target.value),
              })
            }
          />
        </div>
      </div>
      <label htmlFor="route-notes">Notes</label>
      <textarea
        id="route-notes"
        rows={3}
        placeholder="Which roads, notable stops along the way…"
        value={day.route.notes}
        onChange={(e) => updateRoute(day.id, { ...day.route, notes: e.target.value })}
      />
    </section>
  )
}
