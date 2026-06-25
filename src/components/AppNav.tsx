import { useEffect, useRef, useState } from 'react'

export type AppView = 'trip' | 'packing'

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
          <button
            className={view === 'trip' ? 'app-nav-item active' : 'app-nav-item'}
            onClick={() => {
              onChange('trip')
              setOpen(false)
            }}
          >
            Trip
          </button>
          <button
            className={view === 'packing' ? 'app-nav-item active' : 'app-nav-item'}
            onClick={() => {
              onChange('packing')
              setOpen(false)
            }}
          >
            Packing list
          </button>
        </nav>
      )}
    </div>
  )
}
