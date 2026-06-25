import { useTripStore } from '../store'

export function DayNav() {
  const trip = useTripStore((s) => s.trip)
  const addDay = useTripStore((s) => s.addDay)
  const deleteDay = useTripStore((s) => s.deleteDay)
  const setActiveDay = useTripStore((s) => s.setActiveDay)
  const setDayTitle = useTripStore((s) => s.setDayTitle)

  return (
    <nav className="day-nav" aria-label="Days">
      <ul className="day-list">
        {trip.days.map((day, index) => (
          <li key={day.id} className={day.id === trip.activeDayId ? 'day-item active' : 'day-item'}>
            <button
              className="day-item-btn"
              onClick={() => setActiveDay(day.id)}
              aria-current={day.id === trip.activeDayId}
            >
              <span className="day-number mono">Day {index + 1}</span>
              <input
                className="day-title-input"
                value={day.title}
                placeholder="Untitled day"
                onChange={(e) => setDayTitle(day.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </button>
            <button
              className="btn-danger day-delete-btn"
              aria-label={`Delete day ${index + 1}`}
              onClick={() => deleteDay(day.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <button className="btn-primary day-add-btn" onClick={addDay}>
        + Add day
      </button>
    </nav>
  )
}
