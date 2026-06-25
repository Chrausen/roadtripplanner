import { useRef, useState } from 'react'
import type { Coordinates } from '../types'
import { geocodeSearch, type GeocodeResult } from '../api'

interface Props {
  value: string
  coords: Coordinates | null
  placeholder?: string
  onChange: (value: string, coords: Coordinates | null) => void
}

export function AddressSearchInput({ value, coords, placeholder, onChange }: Props) {
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleType(text: string) {
    onChange(text, null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (text.trim().length < 3) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      const r = await geocodeSearch(text)
      setResults(r)
      setOpen(true)
    }, 350)
  }

  function pick(r: GeocodeResult) {
    onChange(r.name, { lat: r.lat, lng: r.lng })
    setResults([])
    setOpen(false)
  }

  return (
    <div className="address-search">
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => handleType(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={coords ? 'address-resolved' : undefined}
      />
      {open && results.length > 0 && (
        <ul className="address-suggestions">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                className="btn-ghost address-suggestion-btn"
                onClick={() => pick(r)}
              >
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
