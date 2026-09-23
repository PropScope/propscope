import { useState, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'

// Show the reliable server-proxied property photo (Street View where available,
// satellite otherwise). Because it is proxied through our own /api, it renders even
// when the visitor's network/extensions block google.com directly. When Street View
// coverage exists we add a button that opens the full interactive view on Google Maps
// in a new tab — more reliable than an embedded Maps iframe.
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

  if (!fallbackUrl || imgFailed) return null

  const svLink = geo && geo.status === 'OK'
    ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${geo.lat},${geo.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`

  return (
    <div className="relative mb-5 overflow-hidden rounded-xl ring-1 ring-ink-100">
      <img
        src={fallbackUrl}
        alt={address}
        onError={() => setImgFailed(true)}
        className="block h-72 w-full bg-ink-50 object-cover object-center"
      />
      <a
        href={svLink}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink-800 shadow ring-1 ring-ink-200 hover:bg-white"
      >
        <ExternalLink size={13} /> {geo && geo.status === 'OK' ? 'Open Street View' : 'View on Google Maps'}
      </a>
    </div>
  )
}
