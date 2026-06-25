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
          <h1>{trip.name}</h1>
          {trip.description && <p className="trip-description">{trip.description}</p>}
          <button className="btn-ghost trip-edit-btn" onClick={() => setEditing(true)}>
            Edit trip
          </button>
        </div>
      )}
    </header>
  )
}
