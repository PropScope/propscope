// Vercel serverless function — speech-to-text for the support widget.
// Receives base64 audio from the browser and transcribes it with ElevenLabs Scribe.
// Requires env var ELEVENLABS_API_KEY.

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

const ELEVEN_URL = 'https://api.elevenlabs.io/v1/speech-to-text'
const MODEL_ID = 'scribe_v1'

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) { res.status(500).json({ error: 'Voice transcription is not configured.' }); return }

  const d = (req.body && typeof req.body === 'object') ? req.body : {}
  const audioB64 = typeof d.audio === 'string' ? d.audio : ''
  const mimeType = (typeof d.mimeType === 'string' && d.mimeType) || 'audio/webm'
  if (!audioB64) { res.status(400).json({ error: 'No audio provided.' }); return }

  let buf
  try { buf = Buffer.from(audioB64, 'base64') } catch (e) { buf = null }
  if (!buf || !buf.length) { res.status(400).json({ error: 'Invalid audio.' }); return }

  try {
    const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : mimeType.includes('wav') ? 'wav' : 'webm'
    const form = new FormData()
    form.append('model_id', MODEL_ID)
    form.append('file', new Blob([buf], { type: mimeType }), `speech.${ext}`)

    const r = await fetch(ELEVEN_URL, {
      method: 'POST',
      headers: { 'xi-api-key': key, accept: 'application/json' },
      body: form,
    })
    if (!r.ok) {
      const detail = await r.text().catch(() => '')
      console.error('ElevenLabs STT error', r.status, detail.slice(0, 500))
      res.status(502).json({ error: 'Transcription service is unavailable right now.' })
      return
    }
    const j = await r.json().catch(() => ({}))
    const text = (j && typeof j.text === 'string') ? j.text.trim() : ''
    res.status(200).json({ text })
  } catch (e) {
    res.status(500).json({ error: 'Could not transcribe the audio.' })
  }
}
