import { useState } from 'react'
import { useTripStore } from '../store'
import { PLACE_TYPES, type Day, type Place, type PlaceType } from '../types'
import { CoordinatePicker } from './CoordinatePicker'
import { ConfirmButton } from './ConfirmButton'

function PlaceCard({ day, place }: { day: Day; place: Place }) {
  const updatePlace = useTripStore((s) => s.updatePlace)
  const deletePlace = useTripStore((s) => s.deletePlace)
  const focusOnMap = useTripStore((s) => s.focusOnMap)
  const [editing, setEditing] = useState(!place.name)

  if (!editing) {
    return (
      <li className="entry-card">
        <div className="entry-row-view">
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
          <span className="entry-row-view-text">{place.name || 'Untitled place'}</span>
          <span className="mono">{place.type}</span>
          <button
            type="button"
            className="btn-icon"
            title="Edit place"
            aria-label={`Edit ${place.name || 'place'}`}
            onClick={() => setEditing(true)}
          >
            ✏️
          </button>
        </div>
      </li>
    )
  }

  return (
    <li className="entry-card">
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
        <button className="btn-secondary" onClick={() => setEditing(false)}>
          Done
        </button>
        <ConfirmButton
          onConfirm={() => deletePlace(day.id, place.id)}
          aria-label={`Delete ${place.name || 'place'}`}
        >
          Delete
        </ConfirmButton>
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
  )
}

export function PlacesSection({ day }: { day: Day }) {
  const addPlace = useTripStore((s) => s.addPlace)

  return (
    <section className="card">
      <h2>Places to visit</h2>
      {day.places.length > 0 ? (
        <ul className="entry-list">
          {day.places.map((place) => (
            <PlaceCard key={place.id} day={day} place={place} />
          ))}
        </ul>
      ) : (
        <p className="empty-state">No places yet — add a sight, museum, or stop to visit.</p>
      )}
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
