import type { Day } from '../types'
import { RouteSection } from './RouteSection'
import { PlacesSection } from './PlacesSection'
import { ActivitiesSection } from './ActivitiesSection'
import { DayMap } from './DayMap'

export function DayView({ day }: { day: Day }) {
  return (
    <div className="day-content">
      <div className="day-sections">
        <RouteSection day={day} />
        <PlacesSection day={day} />
        <ActivitiesSection day={day} />
      </div>
      <div className="day-map-pane">
        <h2>Map</h2>
        <DayMap day={day} />
      </div>
    </div>
  )
}
