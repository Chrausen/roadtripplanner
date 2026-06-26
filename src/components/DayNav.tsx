import { useEffect, useRef, useState } from 'react'
import { useTripStore } from '../store'
import { ConfirmButton } from './ConfirmButton'

export function DayNav() {
  const trip = useTripStore((s) => s.trip)
  const addDay = useTripStore((s) => s.addDay)
  const deleteDay = useTripStore((s) => s.deleteDay)
  const setActiveDay = useTripStore((s) => s.setActiveDay)
  const setDayTitle = useTripStore((s) => s.setDayTitle)
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  const activeIndex = trip.days.findIndex((d) => d.id === trip.activeDayId)
  const activeDay = trip.days[activeIndex]

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div className="day-nav" ref={navRef}>
      <button
        className="btn-secondary day-nav-toggle"
        aria-expanded={open}
        aria-label="Toggle day navigation"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="burger-icon" aria-hidden="true">
          ☰
        </span>
        <span className="mono">
          {activeDay ? `Day ${activeIndex + 1}${activeDay.title ? ` · ${activeDay.title}` : ''}` : 'Days'}
        </span>
      </button>

      {open && (
        <nav className="day-nav-panel" aria-label="Days">
          <ul className="day-list">
            {trip.days.map((day, index) => (
              <li
                key={day.id}
                className={day.id === trip.activeDayId ? 'day-item active' : 'day-item'}
              >
                <button
                  className="day-item-btn"
                  onClick={() => {
                    setActiveDay(day.id)
                    setOpen(false)
                  }}
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
                <ConfirmButton
                  className="btn-danger day-delete-btn"
                  aria-label={`Delete day ${index + 1}`}
                  confirmLabel="✓"
                  onConfirm={() => deleteDay(day.id)}
                >
                  ✕
                </ConfirmButton>
              </li>
            ))}
          </ul>
          <button className="btn-primary day-add-btn" onClick={addDay}>
            + Add day
          </button>
        </nav>
      )}
    </div>
  )
}
