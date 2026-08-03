// Server-side proxy for property photos.
// Uses Google Street View (street-level), falling back to a satellite image.
// Keeps GOOGLE_MAPS_API_KEY server-side. Returns an image, or 404 if unavailable
// (e.g. key not configured) so the UI can hide the photo gracefully.

const MAPS = 'https://maps.googleapis.com/maps/api'

export default async function handler(req, res) {
  try {
    const key = process.env.GOOGLE_MAPS_API_KEY
    const address = (req.query.address || '').toString().trim()
    if (!key || !address) { res.status(404).json({ error: 'unavailable' }); return }

    let w = parseInt(req.query.w, 10) || 640
    let h = parseInt(req.query.h, 10) || 360
    w = Math.min(Math.max(w, 100), 640)
    h = Math.min(Math.max(h, 100), 640)
    const loc = encodeURIComponent(address)

    // 1) Prefer a real street-level photo when Street View has coverage.
    let imgUrl = null
    try {
      const meta = await fetch(`${MAPS}/streetview/metadata?location=${loc}&source=outdoor&key=${key}`)
        .then((r) => r.json())
      if (meta && meta.status === 'OK') {
        imgUrl = `${MAPS}/streetview?size=${w}x${h}&location=${loc}&source=outdoor&fov=80&pitch=8&key=${key}`
      }
    } catch (e) { /* fall through to satellite */ }

    // 2) Fallback: top-down satellite/aerial of the parcel.
    if (!imgUrl) {
      imgUrl = `${MAPS}/staticmap?center=${loc}&zoom=19&size=${w}x${h}&maptype=satellite&key=${key}`
    }

    const img = await fetch(imgUrl)
    if (!img.ok) { res.status(404).json({ error: 'no-image' }); return }
    const buf = Buffer.from(await img.arrayBuffer())
    res.setHeader('Content-Type', img.headers.get('content-type') || 'image/jpeg')
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800')
    res.status(200).send(buf)
  } catch (e) {
    res.status(404).json({ error: 'error' })
  }
}
