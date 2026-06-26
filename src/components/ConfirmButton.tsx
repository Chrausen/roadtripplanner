import { useEffect, useRef, useState } from 'react'

export function ConfirmButton({
  onConfirm,
  className = 'btn-danger',
  confirmLabel = 'Confirm delete?',
  children,
  ...rest
}: {
  onConfirm: () => void
  className?: string
  confirmLabel?: string
  children: React.ReactNode
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'className' | 'children'>) {
  const [confirming, setConfirming] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleClick() {
    if (!confirming) {
      setConfirming(true)
      timerRef.current = setTimeout(() => setConfirming(false), 3000)
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    setConfirming(false)
    onConfirm()
  }

  return (
    <button
      {...rest}
      type="button"
      className={confirming ? `${className} btn-confirming` : className}
      onClick={handleClick}
      onBlur={() => setConfirming(false)}
    >
      {confirming ? confirmLabel : children}
    </button>
  )
}
