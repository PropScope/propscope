// Returns Street View availability + coordinates for an address (server-side key).
// The browser uses this to decide whether to embed an interactive Street View.

const MAPS = 'https://maps.googleapis.com/maps/api'

export default async function handler(req, res) {
  try {
    const key = process.env.GOOGLE_MAPS_API_KEY
    const address = (req.query.address || '').toString().trim()
    if (!key || !address) { res.status(200).json({ status: 'NO_KEY' }); return }
    const loc = encodeURIComponent(address)
    const meta = await fetch(`${MAPS}/streetview/metadata?location=${loc}&source=outdoor&key=${key}`)
      .then((r) => r.json())
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800')
    if (meta && meta.status === 'OK' && meta.location) {
      res.status(200).json({ status: 'OK', lat: meta.location.lat, lng: meta.location.lng, pano: meta.pano_id })
    } else {
      res.status(200).json({ status: (meta && meta.status) || 'ZERO_RESULTS' })
    }
  } catch (e) {
    res.status(200).json({ status: 'ERROR' })
  }
}
