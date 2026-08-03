// Vercel serverless function — securely calls the Claude API to generate a deal analysis.
// The secret ANTHROPIC_API_KEY lives only here (server-side), never in the browser.
// If RENTCAST_API_KEY is set, real market data (value, rent, comps) grounds the analysis.

const SUPABASE_URL = 'https://iplngnllrvivrbjxcovk.supabase.co'

// Pull real market data from RentCast for this address. Returns null on any problem
// so report generation always continues (falls back to AI-only estimates).
async function getMarketData(d) {
  const key = process.env.RENTCAST_API_KEY
  if (!key || !d.address) return null
  const addr = [d.address, d.city, `${d.state || ''} ${d.zip || ''}`.trim()].filter(Boolean).join(', ')
  const q = encodeURIComponent(addr)
  const headers = { 'X-Api-Key': key, accept: 'application/json' }
  try {
    const [vr, rr] = await Promise.all([
      fetch(`https://api.rentcast.io/v1/avm/value?address=${q}`, { headers }),
      fetch(`https://api.rentcast.io/v1/avm/rent/long-term?address=${q}`, { headers }),
    ])
    const value = vr.ok ? await vr.json() : null
    const rent = rr.ok ? await rr.json() : null
    if (!value && !rent) return null
    const src = (value && value.comparables) || (rent && rent.comparables) || []
    const comps = src.slice(0, 5).map((c) => ({
      address: c.formattedAddress || c.address || 'Nearby comparable',
      sold: Math.round(c.price || 0),
      sqft: Math.round(c.squareFootage || 0),
      beds: c.bedrooms ?? null,
      baths: c.bathrooms ?? null,
      dist: c.distance != null ? Math.round(c.distance * 10) / 10 : null,
    })).filter((c) => c.sold > 0)
    return {
      value: value && value.price ? Math.round(value.price) : null,
      valueLow: value && value.priceRangeLow ? Math.round(value.priceRangeLow) : null,
      valueHigh: value && value.priceRangeHigh ? Math.round(value.priceRangeHigh) : null,
      rent: rent && rent.rent ? Math.round(rent.rent) : null,
      comps,
    }
  } catch (e) {
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    res.status(500).json({ error: 'Server is missing the Anthropic API key.' })
    return
  }

  // --- Entitlement: paid plans get a monthly report cap; unpaid users get ONE free report, then must subscribe. ---
  const CAPS = { 'deal-check': 3, 'deal-analyzer': 25, 'investor-pro': 250 }
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (svc) {
    if (!token) { res.status(401).json({ error: 'Please sign in to generate a report.' }); return }
    let entitled = false
    let limitMsg = 'This report requires an active plan.'
    try {
      const ures = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: svc, Authorization: `Bearer ${token}` } })
      const u = ures.ok ? await ures.json() : null
      if (u && u.id) {
        const plan = (u.user_metadata && u.user_metadata.plan) || 'free'
        const auth = { apikey: svc, Authorization: `Bearer ${svc}` }
        if (CAPS[plan]) {
          const now = new Date()
          const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
          const cr = await fetch(`${SUPABASE_URL}/rest/v1/reports?select=id&user_id=eq.${u.id}&created_at=gte.${monthStart}`, { headers: auth })
          const rows = cr.ok ? await cr.json() : []
          const used = Array.isArray(rows) ? rows.length : 0
          if (used < CAPS[plan]) entitled = true
          else limitMsg = `You've used all ${CAPS[plan]} reports on your plan this month. Upgrade for more, or they reset next month.`
        } else {
          const cr = await fetch(`${SUPABASE_URL}/rest/v1/reports?select=id&user_id=eq.${u.id}`, { headers: auth })
          const rows = cr.ok ? await cr.json() : []
          const total = Array.isArray(rows) ? rows.length : 0
          if (total === 0) entitled = true // first report is free
          else limitMsg = 'Your free report has been used. Subscribe to a plan to keep analyzing deals.'
        }
      }
    } catch (e) { entitled = true } // never hard-block a real user on a transient check failure
    if (!entitled) {
      res.status(402).json({ error: limitMsg })
      return
    }
  }

  const d = (req.body && typeof req.body === 'object') ? req.body : {}
  const market = await getMarketData(d)

  const SCOPE = {
    cosmetic: 'a LIGHT / COSMETIC rehab only — paint, flooring, fixtures, minor repairs and cleanup. Roughly $10-20 per square foot in a typical U.S. market; adjust for the local cost of labor and materials.',
    moderate: 'a MODERATE rehab — updated kitchen and bathrooms, some mechanical/systems work (HVAC, electrical, plumbing spot repairs), and cosmetic updates throughout. Roughly $25-45 per square foot in a typical market; adjust for local costs.',
    gut: 'a FULL GUT renovation — down to the studs: new kitchen, bathrooms, flooring, drywall, and all major systems, with possible structural or code work. Roughly $50-90+ per square foot; adjust for local costs and the age of the property.',
  }
  const scopeLine = (!d.rehab && SCOPE[d.rehabScope])
    ? `\nINVESTOR CONDITION ASSESSMENT: The investor inspected this property and assessed it as needing ${SCOPE[d.rehabScope]} Base your rehab budget and itemized rehab list on THIS condition level and the property's square footage, calibrated to the local market. Do not override the condition level the investor selected.`
    : ''

  const marketBlock = market ? `
REAL MARKET DATA (from RentCast — treat as authoritative, not estimates):
- Current market value (as-is): ${market.value ? '$' + market.value : 'n/a'}${market.valueLow && market.valueHigh ? ` (range $${market.valueLow}-$${market.valueHigh})` : ''}
- Estimated long-term monthly rent: ${market.rent ? '$' + market.rent : 'n/a'}
- Real comparable sales:${market.comps.length ? '\n' + market.comps.map((c) => `  - ${c.address} - $${c.sold}, ${c.sqft} sqft, ${c.beds}bd/${c.baths}ba, ${c.dist} mi`).join('\n') : ' n/a'}

Use these real figures as your factual base. Set monthlyRent to the real rent (adjust only for obvious differences). Treat the current market value as the AS-IS value; compute ARV as the current value PLUS the value added by the described rehab (do not simply reuse current value as ARV). Use the real comparable sales in the "comps" array.
` : ''

  const prompt = `You are an expert U.S. residential real estate investment underwriter.
Analyze this deal and return your analysis.

PROPERTY
- Address: ${d.address || '(unknown)'}, ${d.city || ''} ${d.state || ''} ${d.zip || ''}
- Beds / Baths / SqFt / Year built: ${d.beds || '?'} / ${d.baths || '?'} / ${d.sqft || '?'} / ${d.year || '?'}
- Purchase price: ${d.purchasePrice || '(estimate it)'}
- Rehab budget: ${d.rehab || '(estimate it)'}
- Expected monthly rent: ${d.rent || '(estimate it)'}
- After-repair value (ARV): ${d.arv || '(estimate it)'}
- Investor strategy: ${d.strategy || '(recommend the best one)'}
- Investor notes: ${d.notes || 'none'}
${marketBlock}${scopeLine}
Estimate any missing values from typical conditions for that market. Where REAL MARKET DATA is provided above, it overrides generic estimates.
Keep the numbers internally consistent (max allowable offer ~= 70% of ARV minus rehab; cap rate = annual NOI / price; cash-on-cash from cash invested; etc.).

Return ONLY a single JSON object — no markdown, no prose — with EXACTLY these keys:
{
 "score": <integer 0-100, overall deal quality>,
 "verdict": "Strong" | "Moderate" | "Thin",
 "purchasePrice": <number>,
 "arv": <number>,
 "rehab": <number>,
 "monthlyRent": <number>,
 "capRate": <number, percent e.g. 7.8>,
 "cashOnCash": <number, percent>,
 "monthlyCashFlow": <number>,
 "profitFlip": <number, estimated flip profit>,
 "comps": [ {"address": <string>, "sold": <number>, "sqft": <number>, "beds": <number>, "baths": <number>, "dist": <number, miles>} ],
 "rehabItems": [ {"item": <string>, "cost": <number>} ],
 "cashflow": [ {"name": "Yr 1", "value": <number>}, {"name": "Yr 2", "value": <number>}, {"name": "Yr 3", "value": <number>}, {"name": "Yr 4", "value": <number>}, {"name": "Yr 5", "value": <number>} ],
 "strategies": [ {"name": "Fix & Flip", "roi": <number percent>, "profit": <number>}, {"name": "Buy & Hold", "roi": <number percent>, "profit": <number>}, {"name": "BRRRR", "roi": <number percent>, "profit": <number>} ],
 "risks": [ {"label": <string>, "level": "Low" | "Medium" | "High"} ],
 "memo": <string, a 3-4 sentence executive summary with a clear recommendation>
}
Provide 3-5 comps, an itemized rehab budget (include a contingency line), and 3-4 risks.`

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!r.ok) {
      const t = await r.text()
      res.status(502).json({ error: 'The AI request failed.', detail: t.slice(0, 400) })
      return
    }

    const j = await r.json()
    const text = j?.content?.[0]?.text || ''
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start === -1 || end === -1) {
      res.status(502).json({ error: 'The AI did not return valid data.', raw: text.slice(0, 400) })
      return
    }
    const data = JSON.parse(text.slice(start, end + 1))

    // Guarantee the real comps are shown when we have them
    if (market && market.comps && market.comps.length >= 3) data.comps = market.comps
    data.dataSource = market ? 'RentCast + AI' : 'AI estimate'

    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ error: 'Something went wrong generating the report.', detail: String(e).slice(0, 300) })
  }
}
