import { useTripStore } from '../store'
import { ACTIVITY_TYPES, type ActivityType, type Day } from '../types'
import { CoordinatePicker } from './CoordinatePicker'
import { ConfirmButton } from './ConfirmButton'

export function ActivitiesSection({ day }: { day: Day }) {
  const addActivity = useTripStore((s) => s.addActivity)
  const updateActivity = useTripStore((s) => s.updateActivity)
  const deleteActivity = useTripStore((s) => s.deleteActivity)

  return (
    <section className="card">
      <h2>Activities</h2>
      {day.activities.length > 0 ? (
        <ul className="entry-list">
          {day.activities.map((activity) => (
            <li key={activity.id} className="entry-card">
              <div className="entry-row">
                <label className="sr-only" htmlFor={`activity-name-${activity.id}`}>
                  Name
                </label>
                <input
                  id={`activity-name-${activity.id}`}
                  value={activity.name}
                  placeholder="Name"
                  onChange={(e) =>
                    updateActivity(day.id, activity.id, { name: e.target.value })
                  }
                />
                <label className="sr-only" htmlFor={`activity-type-${activity.id}`}>
                  Type
                </label>
                <select
                  id={`activity-type-${activity.id}`}
                  value={activity.type}
                  onChange={(e) =>
                    updateActivity(day.id, activity.id, {
                      type: e.target.value as ActivityType,
                    })
                  }
                >
                  {ACTIVITY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <label className="sr-only" htmlFor={`activity-time-${activity.id}`}>
                  Time
                </label>
                <input
                  id={`activity-time-${activity.id}`}
                  className="mono"
                  type="time"
                  value={activity.time}
                  onChange={(e) =>
                    updateActivity(day.id, activity.id, { time: e.target.value })
                  }
                />
                <ConfirmButton
                  onConfirm={() => deleteActivity(day.id, activity.id)}
                  aria-label={`Delete ${activity.name || 'activity'}`}
                >
                  Delete
                </ConfirmButton>
              </div>
              <label className="sr-only" htmlFor={`activity-notes-${activity.id}`}>
                Notes
              </label>
              <textarea
                id={`activity-notes-${activity.id}`}
                value={activity.notes}
                placeholder="Notes"
                rows={2}
                onChange={(e) =>
                  updateActivity(day.id, activity.id, { notes: e.target.value })
                }
              />
              <CoordinatePicker
                coords={activity.coords}
                onChange={(coords) => updateActivity(day.id, activity.id, { coords })}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">
          No activities yet — add meals, accommodation, shopping, or anything else planned for the day.
        </p>
      )}
      <button
        className="btn-primary"
        onClick={() =>
          addActivity(day.id, {
            name: '',
            type: 'activity',
            time: '',
            notes: '',
            coords: null,
          })
        }
      >
        + Add activity
      </button>
    </section>
  )
}
