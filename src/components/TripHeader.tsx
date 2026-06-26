import { useState } from 'react'
import { useTripStore } from '../store'

export function TripHeader() {
  const trip = useTripStore((s) => s.trip)
  const setTripInfo = useTripStore((s) => s.setTripInfo)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(trip.name)
  const [description, setDescription] = useState(trip.description)

  function save() {
    setTripInfo(name.trim() || 'My Road Trip', description)
    setEditing(false)
  }

  return (
    <header className="trip-header">
      {editing ? (
        <div className="trip-header-edit">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Trip name"
            placeholder="Trip name"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-label="Trip description"
            placeholder="Short description (optional)"
            rows={2}
          />
          <div className="trip-header-actions">
            <button className="btn-primary" onClick={save}>
              Save
            </button>
            <button className="btn-ghost" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="trip-header-view" onClick={() => setEditing(true)}>
          <div className="trip-header-row">
            <h1>{trip.name}</h1>
            <button
              className="trip-edit-icon-btn"
              aria-label="Edit trip"
              onClick={(e) => {
                e.stopPropagation()
                setEditing(true)
              }}
            >
              ✎
            </button>
          </div>
          {trip.description && <p className="trip-description">{trip.description}</p>}
        </div>
      )}
    </header>
  )
}
