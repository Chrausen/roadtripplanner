import { useState } from 'react'
import { useTripStore } from './store'
import { TripHeader } from './components/TripHeader'
import { DayNav } from './components/DayNav'
import { DayView } from './components/DayView'
import { PackingListView } from './components/PackingListView'
import { DataSection } from './components/DataSection'
import { AppNav, type AppView } from './components/AppNav'
import './layout.css'

function App() {
  const trip = useTripStore((s) => s.trip)
  const activeDay = trip.days.find((d) => d.id === trip.activeDayId) ?? null
  const [view, setView] = useState<AppView>('trip')

  return (
    <div className="app-shell">
      <AppNav view={view} onChange={setView} />
      <TripHeader />
      {view === 'trip' ? (
        <>
          <DayNav />
          <main className="app-main">
            {activeDay ? (
              <DayView day={activeDay} />
            ) : (
              <p className="empty-state">No day yet — add one to get started.</p>
            )}
          </main>
        </>
      ) : view === 'packing' ? (
        <main className="app-main">
          <PackingListView />
        </main>
      ) : (
        <main className="app-main">
          <DataSection />
        </main>
      )}
    </div>
  )
}

export default App
