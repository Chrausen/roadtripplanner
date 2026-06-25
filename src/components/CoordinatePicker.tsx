import { useState } from 'react'
import type { Coordinates } from '../types'
import { geocodeSearch, type GeocodeResult } from '../api'

interface Props {
  coords: Coordinates | null
  onChange: (coords: Coordinates | null) => void
}

export function CoordinatePicker({ coords, onChange }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [searching, setSearching] = useState(false)

  async function search() {
    setSearching(true)
    try {
      const r = await geocodeSearch(query)
      setResults(r)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="coord-picker">
      {coords ? (
        <div className="coord-picker-current">
          <span className="mono coord-value">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </span>
          <button className="btn-ghost" onClick={() => onChange(null)}>
            Clear pin
          </button>
        </div>
      ) : (
        <div className="coord-picker-search">
          <div className="coord-search-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a place name…"
              onKeyDown={(e) => e.key === 'Enter' && search()}
            />
            <button className="btn-secondary" onClick={search} disabled={searching}>
              {searching ? 'Searching…' : 'Search'}
            </button>
          </div>
          {results.length > 0 && (
            <ul className="coord-results">
              {results.map((r, i) => (
                <li key={i}>
                  <button
                    className="btn-ghost coord-result-btn"
                    onClick={() => {
                      onChange({ lat: r.lat, lng: r.lng })
                      setResults([])
                      setQuery('')
                    }}
                  >
                    {r.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="coord-hint">Or use "click to add" mode on the map.</p>
        </div>
      )}
    </div>
  )
}
