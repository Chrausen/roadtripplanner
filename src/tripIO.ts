import type { Trip } from './types'

export const TRIP_SCHEMA_VERSION = 1

interface TripExportFile {
  schemaVersion: number
  trip: Trip
}

export function serializeTrip(trip: Trip): string {
  const file: TripExportFile = { schemaVersion: TRIP_SCHEMA_VERSION, trip }
  return JSON.stringify(file)
}

export class TripImportError extends Error {}

export function parseTripFile(raw: string): Trip {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new TripImportError('Not valid JSON.')
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new TripImportError('Not a valid trip file.')
  }
  const file = parsed as Partial<TripExportFile>
  if (typeof file.schemaVersion !== 'number') {
    throw new TripImportError('Missing schema version — not a trip export file.')
  }
  if (file.schemaVersion > TRIP_SCHEMA_VERSION) {
    throw new TripImportError(
      `This file was exported from a newer app version (schema ${file.schemaVersion}) and can't be imported here.`
    )
  }
  const trip = file.trip as Partial<Trip> | undefined
  if (!trip || typeof trip.name !== 'string' || !Array.isArray(trip.days)) {
    throw new TripImportError('Trip data is missing or malformed.')
  }
  return trip as Trip
}

export function downloadTripJson(trip: Trip) {
  const json = serializeTrip(trip)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const safeName = trip.name.trim().replace(/[^a-z0-9-_]+/gi, '_') || 'trip'
  a.href = url
  a.download = `${safeName}.json`
  a.click()
  URL.revokeObjectURL(url)
}
