import { useEffect, useRef, useState } from 'react'

export type AppView = 'trip' | 'packing' | 'data'

const NAV_ITEMS: { id: AppView; label: string }[] = [
  { id: 'trip', label: 'Trip' },
  { id: 'packing', label: 'Packing list' },
  { id: 'data', label: 'Export / import / QR' },
]

export function AppNav({
  view,
  onChange,
}: {
  view: AppView
  onChange: (view: AppView) => void
}) {
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div className="app-nav" ref={navRef}>
      <button
        className="btn-secondary app-nav-toggle"
        aria-expanded={open}
        aria-label="Toggle main menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="burger-icon" aria-hidden="true">
          ☰
        </span>
      </button>

      {open && (
        <nav className="app-nav-panel" aria-label="Main menu">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? 'app-nav-item active' : 'app-nav-item'}
              onClick={() => {
                onChange(item.id)
                setOpen(false)
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}

      <nav className="app-nav-sidebar" aria-label="Main menu">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={view === item.id ? 'app-nav-item active' : 'app-nav-item'}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
