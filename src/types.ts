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

export interface RouteEntry {
  id: string
  from: string
  to: string
  fromCoords: Coordinates | null
  toCoords: Coordinates | null
  notes: string
  geometry: Coordinates[]
  durationSeconds: number | null
  distanceKm: number | null
}

export interface Day {
  id: string
  title: string
  routes: RouteEntry[]
  places: Place[]
  activities: ActivityEntry[]
}

export interface PackingItem {
  id: string
  name: string
  checked: boolean
}

export interface PackingCategory {
  id: string
  name: string
  items: PackingItem[]
}

export interface PackingList {
  items: PackingItem[]
  categories: PackingCategory[]
}

export interface Trip {
  name: string
  description: string
  days: Day[]
  activeDayId: string | null
  packingList: PackingList
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
