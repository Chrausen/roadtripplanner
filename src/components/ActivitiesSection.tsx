import { useTripStore } from '../store'
import { ACTIVITY_TYPES, type ActivityType, type Day } from '../types'
import { CoordinatePicker } from './CoordinatePicker'

export function ActivitiesSection({ day }: { day: Day }) {
  const addActivity = useTripStore((s) => s.addActivity)
  const updateActivity = useTripStore((s) => s.updateActivity)
  const deleteActivity = useTripStore((s) => s.deleteActivity)

  return (
    <section className="card">
      <h2>Activities &amp; Meals</h2>
      <ul className="entry-list">
        {day.activities.map((activity) => (
          <li key={activity.id} className="entry-card">
            <div className="entry-row">
              <input
                value={activity.name}
                placeholder="Name"
                onChange={(e) =>
                  updateActivity(day.id, activity.id, { name: e.target.value })
                }
              />
              <select
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
              <input
                className="mono"
                type="time"
                value={activity.time}
                onChange={(e) =>
                  updateActivity(day.id, activity.id, { time: e.target.value })
                }
              />
              <button
                className="btn-danger"
                onClick={() => deleteActivity(day.id, activity.id)}
                aria-label={`Delete ${activity.name || 'activity'}`}
              >
                Delete
              </button>
            </div>
            <textarea
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
        + Add activity / meal
      </button>
    </section>
  )
}
