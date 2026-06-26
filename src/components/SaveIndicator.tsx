import { useTripStore } from '../store'

export function SaveIndicator() {
  const saveStatus = useTripStore((s) => s.saveStatus)
  return (
    <span className="save-indicator" role="status" aria-live="polite">
      {saveStatus === 'saving' ? 'Saving…' : 'Saved'}
    </span>
  )
}
