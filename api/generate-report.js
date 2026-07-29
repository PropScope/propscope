// Vercel serverless function — securely calls the Claude API to generate a deal analysis.
// The secret ANTHROPIC_API_KEY lives only here (server-side), never in the browser.

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

  const d = (req.body && typeof req.body === 'object') ? req.body : {}

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

Estimate any missing values from typical conditions for that market. These are ESTIMATES, not MLS data.
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
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ error: 'Something went wrong generating the report.', detail: String(e).slice(0, 300) })
  }
}
