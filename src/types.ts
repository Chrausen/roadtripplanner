export type PlaceType =
  | 'sight'
  | 'nature'
  | 'city'
  | 'beach'
  | 'museum'
  | 'viewpoint'
  | 'village'
  | 'other'

export type ActivityType =
  | 'activity'
  | 'meal'
  | 'cafe'
  | 'accommodation'
  | 'shopping'
  | 'other'

export interface Coordinates {
  lat: number
  lng: number
}

export interface Place {
  id: string
  name: string
  type: PlaceType
  notes: string
  coords: Coordinates | null
}

export interface ActivityEntry {
  id: string
  name: string
  type: ActivityType
  time: string
  notes: string
  coords: Coordinates | null
}

export interface RouteSegment {
  id: string
  start: Coordinates
  end: Coordinates
  geometry: Coordinates[]
  durationSeconds: number
  distanceKm: number
}

export interface DayRoute {
  from: string
  to: string
  distanceKm: number | null
  notes: string
}

export interface Day {
  id: string
  title: string
  route: DayRoute
  places: Place[]
  activities: ActivityEntry[]
  mapRoutes: RouteSegment[]
}

export interface Trip {
  name: string
  description: string
  days: Day[]
  activeDayId: string | null
}

export const PLACE_TYPES: PlaceType[] = [
  'sight',
  'nature',
  'city',
  'beach',
  'museum',
  'viewpoint',
  'village',
  'other',
]

export const ACTIVITY_TYPES: ActivityType[] = [
  'activity',
  'meal',
  'cafe',
  'accommodation',
  'shopping',
  'other',
]
