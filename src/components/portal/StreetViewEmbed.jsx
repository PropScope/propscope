import { useState, useEffect } from 'react'

// Vite exposes this to the browser (must be prefixed VITE_).
const EMBED_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY

// Interactive, draggable Street View when coverage + a client key exist.
// Falls back to the static photo (satellite where no street view) otherwise.
export default function StreetViewEmbed({ address, fallbackUrl }) {
  const [geo, setGeo] = useState(null)
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    let live = true
    setGeo(null); setImgFailed(false)
    if (!address) return
    fetch(`/api/property-geo?address=${encodeURIComponent(address)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((g) => { if (live) setGeo(g || { status: 'ERROR' }) })
      .catch(() => { if (live) setGeo({ status: 'ERROR' }) })
    return () => { live = false }
  }, [address])

  if (EMBED_KEY && geo && geo.status === 'OK') {
    const src = `https://www.google.com/maps/embed/v1/streetview?key=${EMBED_KEY}` +
      `&location=${geo.lat},${geo.lng}&heading=0&pitch=0&fov=90`
    return (
      <div className="mb-5 overflow-hidden rounded-xl ring-1 ring-ink-100">
        <iframe
          title="Property Street View"
          src={src}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-72 w-full border-0"
        />
      </div>
    )
  }

  if (fallbackUrl && !imgFailed) {
    return (
      <img
        src={fallbackUrl}
        alt={address}
        onError={() => setImgFailed(true)}
        className="mb-5 block h-72 w-full rounded-xl object-cover object-center ring-1 ring-ink-100 bg-ink-50"
      />
    )
  }
  return null
}
