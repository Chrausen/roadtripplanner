import { useTripStore } from './store'
import { TripHeader } from './components/TripHeader'
import { DayNav } from './components/DayNav'
import { DayView } from './components/DayView'
import './layout.css'

function App() {
  const trip = useTripStore((s) => s.trip)
  const activeDay = trip.days.find((d) => d.id === trip.activeDayId) ?? null

  return (
    <div className="app-shell">
      <TripHeader />
      <div className="app-body">
        <DayNav />
        <main className="app-main">
          {activeDay ? (
            <DayView day={activeDay} />
          ) : (
            <p className="empty-state">No day yet — add one to get started.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
