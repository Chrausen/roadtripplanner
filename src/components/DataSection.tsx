import { useRef, useState } from 'react'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import { useTripStore } from '../store'
import { downloadTripJson, parseTripFile, serializeTrip, TripImportError } from '../tripIO'

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

function readFileAsImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load image.'))
    img.src = URL.createObjectURL(file)
  })
}

function decodeQrFromImage(img: HTMLImageElement): string | null {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const result = jsQR(imageData.data, imageData.width, imageData.height)
  return result?.data ?? null
}

export function DataSection() {
  const trip = useTripStore((s) => s.trip)
  const replaceTrip = useTripStore((s) => s.replaceTrip)

  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrError, setQrError] = useState<string | null>(null)
  const qrFileInputRef = useRef<HTMLInputElement>(null)

  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanLoopRef = useRef<number | null>(null)

  function applyImportedTrip(parsed: ReturnType<typeof parseTripFile>) {
    const ok = window.confirm(
      `Import "${parsed.name}"? This will replace your current trip data.`
    )
    if (!ok) return
    replaceTrip(parsed)
    setImportSuccess(true)
    setImportError(null)
  }

  async function handleImportFile(file: File) {
    setImportError(null)
    setImportSuccess(false)
    try {
      const text = await readFileAsText(file)
      const parsed = parseTripFile(text)
      applyImportedTrip(parsed)
    } catch (err) {
      setImportError(err instanceof TripImportError ? err.message : 'Could not read file.')
    }
  }

  function generateQr() {
    setQrError(null)
    setQrDataUrl(null)
    const json = serializeTrip(trip)
    QRCode.toDataURL(json, { errorCorrectionLevel: 'L', margin: 1 })
      .then(setQrDataUrl)
      .catch(() => {
        setQrError(
          'This trip has too much data to fit in a QR code. Use JSON export/import instead.'
        )
      })
  }

  async function handleScanFile(file: File) {
    setScanError(null)
    try {
      const img = await readFileAsImage(file)
      const text = decodeQrFromImage(img)
      if (!text) {
        setScanError('No QR code found in that image.')
        return
      }
      const parsed = parseTripFile(text)
      applyImportedTrip(parsed)
    } catch (err) {
      setScanError(err instanceof TripImportError ? err.message : 'Could not read QR code.')
    }
  }

  async function startCameraScan() {
    setScanError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScanning(true)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const tick = () => {
        const video = videoRef.current
        if (video && ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const result = jsQR(imageData.data, imageData.width, imageData.height)
          if (result?.data) {
            stopCameraScan()
            try {
              const parsed = parseTripFile(result.data)
              applyImportedTrip(parsed)
            } catch (err) {
              setScanError(
                err instanceof TripImportError ? err.message : 'Could not read QR code.'
              )
            }
            return
          }
        }
        scanLoopRef.current = requestAnimationFrame(tick)
      }
      scanLoopRef.current = requestAnimationFrame(tick)
    } catch {
      setScanError('Could not access the camera.')
    }
  }

  function stopCameraScan() {
    if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current)
    scanLoopRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setScanning(false)
  }

  return (
    <div className="data-section">
      <section className="card">
        <h2>Export / import</h2>
        <p>Save your trip to a JSON file, or restore it from one.</p>
        <div className="data-actions">
          <button className="btn-primary" onClick={() => downloadTripJson(trip)}>
            Export trip as JSON
          </button>
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
            Import trip from JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="visually-hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) void handleImportFile(file)
            }}
          />
        </div>
        {importError && <p className="data-error">{importError}</p>}
        {importSuccess && <p className="data-success">Trip imported.</p>}
      </section>

      <section className="card">
        <h2>Share via QR code</h2>
        <p>Generate a QR code for this trip, or scan one to import a shared trip.</p>
        <div className="data-actions">
          <button className="btn-primary" onClick={generateQr}>
            Generate QR code
          </button>
        </div>
        {qrError && <p className="data-error">{qrError}</p>}
        {qrDataUrl && <img className="qr-preview" src={qrDataUrl} alt="Trip QR code" />}

        <div className="data-actions" style={{ marginTop: '1rem' }}>
          {!scanning ? (
            <button className="btn-secondary" onClick={startCameraScan}>
              Scan with camera
            </button>
          ) : (
            <button className="btn-danger" onClick={stopCameraScan}>
              Stop scanning
            </button>
          )}
          <button className="btn-secondary" onClick={() => qrFileInputRef.current?.click()}>
            Scan from image
          </button>
          <input
            ref={qrFileInputRef}
            type="file"
            accept="image/*"
            className="visually-hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) void handleScanFile(file)
            }}
          />
        </div>
        {scanning && <video ref={videoRef} className="qr-scan-video" muted playsInline />}
        {scanError && <p className="data-error">{scanError}</p>}
      </section>
    </div>
  )
}
