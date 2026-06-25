import { useTripStore } from '../store'
import { PLACE_TYPES, type Day, type PlaceType } from '../types'
import { CoordinatePicker } from './CoordinatePicker'

export function PlacesSection({ day }: { day: Day }) {
  const addPlace = useTripStore((s) => s.addPlace)
  const updatePlace = useTripStore((s) => s.updatePlace)
  const deletePlace = useTripStore((s) => s.deletePlace)
  const focusOnMap = useTripStore((s) => s.focusOnMap)

  return (
    <section className="card">
      <h2>Places to visit</h2>
      <ul className="entry-list">
        {day.places.map((place) => (
          <li key={place.id} className="entry-card">
            <div className="entry-row">
              {place.coords && (
                <button
                  type="button"
                  className="btn-link"
                  title="Zoom map to this place"
                  onClick={() => focusOnMap(place.coords!)}
                >
                  📍
                </button>
              )}
              <input
                value={place.name}
                placeholder="Place name"
                onChange={(e) => updatePlace(day.id, place.id, { name: e.target.value })}
              />
              <select
                value={place.type}
                onChange={(e) =>
                  updatePlace(day.id, place.id, { type: e.target.value as PlaceType })
                }
              >
                {PLACE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <button
                className="btn-danger"
                onClick={() => deletePlace(day.id, place.id)}
                aria-label={`Delete ${place.name || 'place'}`}
              >
                Delete
              </button>
            </div>
            <textarea
              value={place.notes}
              placeholder="Notes"
              rows={2}
              onChange={(e) => updatePlace(day.id, place.id, { notes: e.target.value })}
            />
            <CoordinatePicker
              coords={place.coords}
              onChange={(coords) => updatePlace(day.id, place.id, { coords })}
            />
          </li>
        ))}
      </ul>
      <button
        className="btn-primary"
        onClick={() =>
          addPlace(day.id, { name: '', type: 'sight', notes: '', coords: null })
        }
      >
        + Add place
      </button>
    </section>
  )
}
