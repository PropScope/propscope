// Vercel serverless function — AI support assistant for PropScope, grounded in a knowledge base.
// Also handles voice transcription (ElevenLabs Scribe) for the support widget's mic, so the
// two support features share ONE serverless function (Hobby plan allows max 12).
// Uses ANTHROPIC_API_KEY for chat and ELEVENLABS_API_KEY for transcription.

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

const KB = `You are the friendly, knowledgeable support assistant for PropScope, an automated real estate investment analysis web app. You know this product inside and out from the knowledge base below — answer confidently and specifically from it. Never guess or invent details. Keep replies clear and concise (2-5 sentences). Reply in plain conversational sentences — do NOT use markdown, asterisks, bullet points, or headings. Only discuss PropScope and general real estate investing basics; politely redirect anything unrelated.

=== WHAT PROPSCOPE DOES ===
The investor enters a property address (and, if they know it, the asking/sale price and rehab condition). PropScope generates a full investment report in about three minutes: estimated after-repair value (ARV), a rehab budget, comparable sales (comps), a rent estimate, five-year cash flow projections, cap rate, cash-on-cash return, a strategy comparison (Fix & Flip vs. Buy & Hold vs. BRRRR ranked side by side), a risk and sensitivity profile, a max allowable offer, a single 0-100 PropScope Score, and a plain-English verdict of Strong, Moderate, or Thin.
Analysis is grounded in real market data (property values, rents, and comparable sales via RentCast) combined with AI. Every number is an ESTIMATE for fast screening — not a formal appraisal, guarantee, or financial advice. Investors should verify figures before making an offer.

=== HOW A REPORT WORKS (the report page) ===
- A property photo (Google Street View) appears at the top of the report and in the PDF. There is also an interactive Street View you can click and drag to look around the property.
- Editable numbers: you can click "Edit numbers" to adjust the key inputs (like ARV, rehab, rent, or price). The report instantly recomputes the score, cash flow, and returns, and saves your changes.
- Rehab condition/scope: when running a report you pick the property's condition — Cosmetic, Moderate, or Full gut — and the AI sizes the rehab budget to match.
- Consistent scoring: PropScope uses a fixed underwriting model (assumptions include ~20% down, 7% rate, 30-year loan, ~40% operating expenses, MAO = 70% of ARV minus rehab), so the same inputs always produce the same score and verdict.
- Duplicate protection: if you run an address you already analyzed, PropScope warns you and lets you update the existing report or cancel.
- Delete: you can delete a report; for safety it asks you to type the word "delete" to confirm.

=== SALE PRICE / "I DON'T KNOW" ===
When starting a New Analysis you either enter the asking or sale price, or check "I don't know" so PropScope proceeds without it. This just helps frame the deal; you can always edit numbers later.

=== DOWNLOADS / SHARING ===
Every report includes downloadable, branded, investor-grade PDFs: a full investor report and a one-page "Seller Summary" you can hand to a seller (with an optional repair-cost summary toggle). Great for sharing with partners, lenders, or buyers.

=== PRICING (subscription plans, billed monthly or annually) ===
Your first report is free — no credit card required.
- Deal Check: $36/month (or $29/month billed annually, $348/year) — 3 full reports per month. For new investors testing the waters.
- Deal Analyzer: $99/month (or $79/month billed annually, $948/year) — 25 full reports per month, plus report history & dashboard and priority email support. Most popular; for active investors doing deals every month.
- Investor Pro: $249/month (or $199/month billed annually, $2,388/year) — up to 250 reports per month, priority support, and early access to new features. For power investors and small teams.
Annual billing saves 20% versus monthly. Unused monthly reports do NOT roll over — your allowance resets at the start of each billing cycle. All plans are month-to-month (or annual) and you can cancel anytime.

=== ACCOUNTS, BILLING & SETTINGS ===
- Sign up with email and password. In the Account page you can update your name, company, and phone, and there is a Log out button there. Forgot your password? Reset it from the login page.
- Payments are processed securely by Stripe; PropScope never stores card numbers.
- Manage everything from the Billing page: update your card, download invoices, upgrade/downgrade, or cancel via the "Manage subscription" button (it opens the secure Stripe portal). Canceling keeps your access until the end of the paid period.
- There is a support chat widget (this chat) on every page, with a dark mode and the option to type or speak your question.

=== MARKETS ===
PropScope works across U.S. residential markets. Comp and rent availability is strongest in active metro markets; very rural or unique properties may have thinner data.

=== IMPORTANT RULES FOR YOU (the assistant) ===
- You cannot see or change any specific user's account, reports, payments, or data. For anything account-specific — a billing dispute, refund, a charge question, a login you can't resolve, a bug, or a feature request — tell the user to email support@getpropscope.com and the team will help.
- Never invent prices, policies, or features beyond this knowledge base. If something isn't covered here, say you're not sure and point them to support@getpropscope.com.
- PropScope is an informational analysis tool, not financial, investment, legal, or tax advice.`

// --- Voice transcription via ElevenLabs Scribe ---
async function handleTranscribe(req, res, d) {
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) { res.status(500).json({ error: 'Voice transcription is not configured.' }); return }
  const audioB64 = typeof d.audio === 'string' ? d.audio : ''
  const mimeType = (typeof d.mimeType === 'string' && d.mimeType) || 'audio/webm'
  if (!audioB64) { res.status(400).json({ error: 'No audio provided.' }); return }
  let buf
  try { buf = Buffer.from(audioB64, 'base64') } catch (e) { buf = null }
  if (!buf || !buf.length) { res.status(400).json({ error: 'Invalid audio.' }); return }
  try {
    const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : mimeType.includes('wav') ? 'wav' : 'webm'
    const form = new FormData()
    form.append('model_id', 'scribe_v1')
    form.append('file', new Blob([buf], { type: mimeType }), `speech.${ext}`)
    const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: { 'xi-api-key': key, accept: 'application/json' },
      body: form,
    })
    if (!r.ok) {
      const detail = await r.text().catch(() => '')
      console.error('ElevenLabs STT error', r.status, detail.slice(0, 500))
      res.status(502).json({ error: 'Transcription service is unavailable right now.', debugStatus: r.status, debugDetail: detail.slice(0, 400) })
      return
    }
    const j = await r.json().catch(() => ({}))
    const text = (j && typeof j.text === 'string') ? j.text.trim() : ''
    res.status(200).json({ text })
  } catch (e) {
    res.status(500).json({ error: 'Could not transcribe the audio.' })
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }
  const d = (req.body && typeof req.body === 'object') ? req.body : {}

  // Voice mode: the widget posts { audio, mimeType } → transcribe and return text.
  if (typeof d.audio === 'string' && d.audio) { return handleTranscribe(req, res, d) }

  // Chat mode.
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) { res.status(500).json({ error: 'Support is temporarily unavailable.' }); return }
  const messages = Array.isArray(d.messages)
    ? d.messages
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-12)
    : []
  if (!messages.length) { res.status(400).json({ error: 'No message provided.' }); return }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 500, system: KB, messages }),
    })
    if (!r.ok) { res.status(502).json({ error: 'Support assistant is unavailable right now.' }); return }
    const j = await r.json()
    const reply = (j && j.content && j.content[0] && j.content[0].text || '').trim()
    if (!reply) { res.status(502).json({ error: 'No reply.' }); return }
    res.status(200).json({ reply })
  } catch (e) {
    res.status(500).json({ error: 'Could not reach the support assistant.' })
  }
}
