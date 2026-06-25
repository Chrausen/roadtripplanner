import { create } from 'zustand'
import type {
  ActivityEntry,
  ActivityType,
  Coordinates,
  Day,
  Place,
  PlaceType,
  PackingList,
  RouteEntry,
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
    routes: [],
    places: [],
    activities: [],
  }
}

function defaultPackingList(): PackingList {
  return { items: [], categories: [] }
}

function defaultTrip(): Trip {
  const day = makeDay()
  return {
    name: 'My Road Trip',
    description: '',
    days: [day],
    activeDayId: day.id,
    packingList: defaultPackingList(),
  }
}

function normalizeTrip(trip: Trip): Trip {
  return {
    ...trip,
    days: trip.days.map((day) => {
      const d = day as Day & { route?: unknown; mapRoutes?: unknown }
      if (Array.isArray(d.routes)) return day
      return { ...day, routes: [] }
    }),
    packingList: trip.packingList ?? defaultPackingList(),
  }
}

interface TripState {
  trip: Trip
  setTripInfo: (name: string, description: string) => void
  addDay: () => void
  deleteDay: (dayId: string) => void
  setActiveDay: (dayId: string) => void
  setDayTitle: (dayId: string, title: string) => void
  addRoute: (dayId: string, route: Omit<RouteEntry, 'id'>) => string
  updateRoute: (dayId: string, routeId: string, patch: Partial<RouteEntry>) => void
  deleteRoute: (dayId: string, routeId: string) => void
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
  addPackingCategory: (name: string) => void
  renamePackingCategory: (categoryId: string, name: string) => void
  deletePackingCategory: (categoryId: string) => void
  addPackingItem: (categoryId: string | null, name: string) => void
  togglePackingItem: (categoryId: string | null, itemId: string) => void
  deletePackingItem: (categoryId: string | null, itemId: string) => void
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
  const loaded = loadTrip()
  const initial = loaded ? normalizeTrip(loaded) : defaultTrip()

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

    addRoute: (dayId, route) => {
      const id = uid()
      commit(
        withDay(get().trip, dayId, (d) => ({
          ...d,
          routes: [...d.routes, { ...route, id }],
        }))
      )
      return id
    },

    updateRoute: (dayId, routeId, patch) => {
      commit(
        withDay(get().trip, dayId, (d) => ({
          ...d,
          routes: d.routes.map((r) => (r.id === routeId ? { ...r, ...patch } : r)),
        }))
      )
    },

    deleteRoute: (dayId, routeId) => {
      commit(
        withDay(get().trip, dayId, (d) => ({
          ...d,
          routes: d.routes.filter((r) => r.id !== routeId),
        }))
      )
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

    addPackingCategory: (name) => {
      const trip = get().trip
      commit({
        ...trip,
        packingList: {
          ...trip.packingList,
          categories: [
            ...trip.packingList.categories,
            { id: uid(), name, items: [] },
          ],
        },
      })
    },

    renamePackingCategory: (categoryId, name) => {
      const trip = get().trip
      commit({
        ...trip,
        packingList: {
          ...trip.packingList,
          categories: trip.packingList.categories.map((c) =>
            c.id === categoryId ? { ...c, name } : c
          ),
        },
      })
    },

    deletePackingCategory: (categoryId) => {
      const trip = get().trip
      commit({
        ...trip,
        packingList: {
          ...trip.packingList,
          categories: trip.packingList.categories.filter((c) => c.id !== categoryId),
        },
      })
    },

    addPackingItem: (categoryId, name) => {
      const trip = get().trip
      const item = { id: uid(), name, checked: false }
      if (categoryId === null) {
        commit({
          ...trip,
          packingList: {
            ...trip.packingList,
            items: [...trip.packingList.items, item],
          },
        })
        return
      }
      commit({
        ...trip,
        packingList: {
          ...trip.packingList,
          categories: trip.packingList.categories.map((c) =>
            c.id === categoryId ? { ...c, items: [...c.items, item] } : c
          ),
        },
      })
    },

    togglePackingItem: (categoryId, itemId) => {
      const trip = get().trip
      if (categoryId === null) {
        commit({
          ...trip,
          packingList: {
            ...trip.packingList,
            items: trip.packingList.items.map((i) =>
              i.id === itemId ? { ...i, checked: !i.checked } : i
            ),
          },
        })
        return
      }
      commit({
        ...trip,
        packingList: {
          ...trip.packingList,
          categories: trip.packingList.categories.map((c) =>
            c.id === categoryId
              ? {
                  ...c,
                  items: c.items.map((i) =>
                    i.id === itemId ? { ...i, checked: !i.checked } : i
                  ),
                }
              : c
          ),
        },
      })
    },

    deletePackingItem: (categoryId, itemId) => {
      const trip = get().trip
      if (categoryId === null) {
        commit({
          ...trip,
          packingList: {
            ...trip.packingList,
            items: trip.packingList.items.filter((i) => i.id !== itemId),
          },
        })
        return
      }
      commit({
        ...trip,
        packingList: {
          ...trip.packingList,
          categories: trip.packingList.categories.map((c) =>
            c.id === categoryId
              ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
              : c
          ),
        },
      })
    },
  }
})

export type { PlaceType, ActivityType, Coordinates }
