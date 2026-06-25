import { create } from 'zustand'
import type {
  ActivityEntry,
  ActivityType,
  Coordinates,
  Day,
  Place,
  PlaceType,
  RouteSegment,
  Trip,
} from './types'
import { loadTrip, saveTrip } from './storage'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function makeDay(): Day {
  return {
    id: uid(),
    title: '',
    route: { from: '', to: '', distanceKm: null, notes: '' },
    places: [],
    activities: [],
    mapRoutes: [],
  }
}

function defaultTrip(): Trip {
  const day = makeDay()
  return {
    name: 'My Road Trip',
    description: '',
    days: [day],
    activeDayId: day.id,
  }
}

interface TripState {
  trip: Trip
  setTripInfo: (name: string, description: string) => void
  addDay: () => void
  deleteDay: (dayId: string) => void
  setActiveDay: (dayId: string) => void
  setDayTitle: (dayId: string, title: string) => void
  updateRoute: (dayId: string, route: Day['route']) => void
  addPlace: (dayId: string, place: Omit<Place, 'id'>) => void
  updatePlace: (dayId: string, placeId: string, patch: Partial<Place>) => void
  deletePlace: (dayId: string, placeId: string) => void
  addActivity: (dayId: string, activity: Omit<ActivityEntry, 'id'>) => void
  updateActivity: (
    dayId: string,
    activityId: string,
    patch: Partial<ActivityEntry>
  ) => void
  deleteActivity: (dayId: string, activityId: string) => void
  addMapRoute: (dayId: string, route: Omit<RouteSegment, 'id'>) => void
  deleteMapRoute: (dayId: string, routeId: string) => void
}

let saveTimer: ReturnType<typeof setTimeout> | null = null
function scheduleSave(trip: Trip) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveTrip(trip), 400)
}

function withDay(trip: Trip, dayId: string, fn: (day: Day) => Day): Trip {
  return {
    ...trip,
    days: trip.days.map((d) => (d.id === dayId ? fn(d) : d)),
  }
}

export const useTripStore = create<TripState>((set, get) => {
  const initial = loadTrip() ?? defaultTrip()

  const commit = (trip: Trip) => {
    scheduleSave(trip)
    set({ trip })
  }

  return {
    trip: initial,

    setTripInfo: (name, description) => {
      commit({ ...get().trip, name, description })
    },

    addDay: () => {
      const trip = get().trip
      const day = makeDay()
      commit({
        ...trip,
        days: [...trip.days, day],
        activeDayId: day.id,
      })
    },

    deleteDay: (dayId) => {
      const trip = get().trip
      const days = trip.days.filter((d) => d.id !== dayId)
      const activeDayId =
        trip.activeDayId === dayId ? days[0]?.id ?? null : trip.activeDayId
      commit({ ...trip, days, activeDayId })
    },

    setActiveDay: (dayId) => {
      commit({ ...get().trip, activeDayId: dayId })
    },

    setDayTitle: (dayId, title) => {
      commit(withDay(get().trip, dayId, (d) => ({ ...d, title })))
    },

    updateRoute: (dayId, route) => {
      commit(withDay(get().trip, dayId, (d) => ({ ...d, route })))
    },

    addPlace: (dayId, place) => {
      commit(
        withDay(get().trip, dayId, (d) => ({
          ...d,
          places: [...d.places, { ...place, id: uid() }],
        }))
      )
    },

    updatePlace: (dayId, placeId, patch) => {
      commit(
        withDay(get().trip, dayId, (d) => ({
          ...d,
          places: d.places.map((p) =>
            p.id === placeId ? { ...p, ...patch } : p
          ),
        }))
      )
    },

    deletePlace: (dayId, placeId) => {
      commit(
        withDay(get().trip, dayId, (d) => ({
          ...d,
          places: d.places.filter((p) => p.id !== placeId),
        }))
      )
    },

    addActivity: (dayId, activity) => {
      commit(
        withDay(get().trip, dayId, (d) => ({
          ...d,
          activities: [...d.activities, { ...activity, id: uid() }],
        }))
      )
    },

    updateActivity: (dayId, activityId, patch) => {
      commit(
        withDay(get().trip, dayId, (d) => ({
          ...d,
          activities: d.activities.map((a) =>
            a.id === activityId ? { ...a, ...patch } : a
          ),
        }))
      )
    },

    deleteActivity: (dayId, activityId) => {
      commit(
        withDay(get().trip, dayId, (d) => ({
          ...d,
          activities: d.activities.filter((a) => a.id !== activityId),
        }))
      )
    },

    addMapRoute: (dayId, route) => {
      commit(
        withDay(get().trip, dayId, (d) => ({
          ...d,
          mapRoutes: [...d.mapRoutes, { ...route, id: uid() }],
        }))
      )
    },

    deleteMapRoute: (dayId, routeId) => {
      commit(
        withDay(get().trip, dayId, (d) => ({
          ...d,
          mapRoutes: d.mapRoutes.filter((r) => r.id !== routeId),
        }))
      )
    },
  }
})

export type { PlaceType, ActivityType, Coordinates }
