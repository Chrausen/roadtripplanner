import type { Trip } from './types'

const STORAGE_KEY = 'roadtripplanner.trip'

export function loadTrip(): Trip | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Trip
  } catch {
    return null
  }
}

export function saveTrip(trip: Trip) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trip))
}
