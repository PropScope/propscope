import { jsPDF } from 'jspdf'
import { reportDetail } from './mockData.js'
import { planById } from './plans.js'
import { usd, pct, dateFmt } from './format.js'

// ---- palette ----
const NAVY = [33, 63, 102]
const EMERALD = [16, 185, 129]
const EMERALD7 = [4, 120, 87]
const INK = [30, 41, 59]
const INK5 = [100, 116, 139]
const LINE = [226, 232, 240]
const SOFT = [248, 250, 252]
const VERDICT = { Strong: EMERALD, Moderate: [217, 119, 6], Thin: [225, 29, 72] }
const RISK = { Low: EMERALD7, Medium: [217, 119, 6], High: [225, 29, 72] }

const n = (v) => Number(v) || 0
const slug = (s) => String(s || 'report').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()

const M = 48            // left/right margin
const RIGHT = 564       // right content edge (612 - 48)
const BOTTOM = 792 - 56 // page bottom threshold

function newDoc() { return new jsPDF({ unit: 'pt', format: 'letter' }) }

function ensure(doc, y, need) {
  if (y + need > BOTTOM) { doc.addPage(); return 56 }
  return y
}

function header(doc, subtitle) {
  doc.setFillColor(...NAVY); doc.rect(0, 0, 612, 84, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(20)
  doc.setTextColor(255, 255, 255); doc.text('Prop', M, 46)
  const pw = doc.getTextWidth('Prop')
  doc.setTextColor(...EMERALD); doc.text('Scope', M + pw, 46)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(214, 226, 244)
  doc.text(subtitle, M, 66)
  doc.setFontSize(9); doc.setTextColor(190, 206, 230)
  const dt = 'Generated ' + dateFmt(new Date().toISOString())
  doc.text(dt, RIGHT, 66, { align: 'right' })
  return 84 + 26
}

function sectionTitle(doc, y, txt) {
  y = ensure(doc, y, 40)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(...NAVY)
  doc.text(txt, M, y)
  doc.setDrawColor(...LINE); doc.setLineWidth(1); doc.line(M, y + 6, RIGHT, y + 6)
  return y + 22
}

function table(doc, y, cols, rows) {
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...INK5)
  cols.forEach((c) => {
    const right = c.align === 'right'
    doc.text(c.label, right ? c.x + c.w : c.x, y, { align: right ? 'right' : 'left' })
  })
  y += 6; doc.setDrawColor(...LINE); doc.setLineWidth(0.8); doc.line(M, y, RIGHT, y); y += 14
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(...INK)
  rows.forEach((row) => {
    y = ensure(doc, y, 20)
    cols.forEach((c) => {
      const right = c.align === 'right'
      doc.text(String(row[c.key] ?? ''), right ? c.x + c.w : c.x, y, { align: right ? 'right' : 'left' })
    })
    y += 8; doc.setDrawColor(240, 243, 247); doc.line(M, y, RIGHT, y); y += 12
  })
  return y + 4
}

function metrics(doc, y, items) {
  const per = 4, cellW = (RIGHT - M) / per
  items.forEach((it, i) => {
    const x = M + (i % per) * cellW
    const cy = y + Math.floor(i / per) * 46
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...INK5)
    doc.text(it.label, x, cy)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...(it.accent || INK))
    doc.text(String(it.value), x, cy + 16)
  })
  return y + Math.ceil(items.length / per) * 46 + 6
}

function banner(doc, y, r, d) {
  const col = VERDICT[r.verdict] || VERDICT.Moderate
  const best = d.strategies.slice().sort((a, b) => n(b.roi) - n(a.roi))[0]
  const title = `Verdict: ${r.verdict}${best ? ` — best played as ${best.name}` : ''}`
  const msg = `At ${usd(n(r.purchasePrice))} in with ${usd(n(r.rehab))} rehab against a ${usd(n(r.arv))} after-repair value.`
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5)
  const lines = doc.splitTextToSize(msg, RIGHT - M - 24)
  const h = 20 + lines.length * 12 + 12
  y = ensure(doc, y, h + 10)
  doc.setFillColor(...SOFT); doc.roundedRect(M, y, RIGHT - M, h, 4, 4, 'F')
  doc.setFillColor(...col); doc.rect(M, y, 4, h, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...col)
  doc.text(title, M + 16, y + 20)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(...INK)
  doc.text(lines, M + 16, y + 36)
  return y + h + 18
}

function footers(doc, note) {
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...INK5)
    doc.text(note, 306, 776, { align: 'center' })
    doc.text(`Page ${i} of ${total}`, RIGHT, 776, { align: 'right' })
  }
}

// Group itemized rehab lines into a few seller-friendly buckets with subtotals.
function groupRehab(items) {
  const buckets = [
    { label: 'Roof & major systems', match: /(roof|hvac|furnace|\bac\b|air.?condition|electric|plumb|foundation|water heater|system|mechanical)/i, cost: 0 },
    { label: 'Kitchen & baths', match: /(kitchen|bath)/i, cost: 0 },
    { label: 'Cosmetic & flooring', match: /(paint|floor|cosmetic|drywall|interior|exterior|landscap|window|door|trim)/i, cost: 0 },
    { label: 'Permits & contingency', match: /(conting|permit|misc|\bfee|other)/i, cost: 0 },
  ]
  const other = { label: 'Other work', cost: 0 }
  ;(items || []).forEach((it) => {
    const c = n(it.cost)
    const b = buckets.find((bk) => bk.match.test(it.item || ''))
    if (b) b.cost += c; else other.cost += c
  })
  const out = buckets.filter((b) => b.cost > 0).map((b) => ({ label: b.label, cost: b.cost }))
  if (other.cost > 0) out.push({ label: other.label, cost: other.cost })
  return out
}

// Optional "Prepared by" contact block (from the user's profile).
function preparedBy(doc, y, contact) {
  if (!contact) return y
  const nameLine = [contact.name, contact.company].filter(Boolean).join('  ·  ')
  const contactLine = [contact.phone, contact.email].filter(Boolean).join('   ·   ')
  if (!nameLine && !contactLine) return y
  y = ensure(doc, y, 54)
  doc.setDrawColor(...LINE); doc.setLineWidth(0.8); doc.line(M, y, RIGHT, y); y += 16
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...INK5)
  doc.text('PREPARED BY', M, y); y += 14
  if (nameLine) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(...NAVY)
    doc.text(nameLine, M, y); y += 13
  }
  if (contactLine) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(...INK)
    doc.text(contactLine, M, y); y += 12
  }
  return y + 6
}

// ================= Investor report =================
export function downloadInvestorReport(r, opts = {}) {
  if (!r) return
  const d = reportDetail(r)
  const tier = planById(r.tier)
  const mao = Math.round(n(r.arv) * 0.7 - n(r.rehab))
  const doc = newDoc()
  let y = header(doc, 'Investment Analysis Report')

  doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.setTextColor(...NAVY)
  doc.text(r.address || 'Property', M, y)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...INK5)
  doc.text('PROPSCOPE SCORE', RIGHT, y - 10, { align: 'right' })
  doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(...NAVY)
  doc.text(`${n(r.score)}`, RIGHT, y + 12, { align: 'right' })
  y += 16
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(...INK5)
  doc.text(`${r.city || ''}, ${r.state || ''} ${r.zip || ''}`.trim(), M, y)
  y += 16
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...NAVY)
  doc.text(`${tier?.name || r.tier || ''}   •   ${r.strategy || ''}`, M, y)
  y += 18

  y = banner(doc, y, r, d)

  y = metrics(doc, y, [
    { label: 'Purchase price', value: usd(n(r.purchasePrice)) },
    { label: 'After-repair value', value: usd(n(r.arv)), accent: NAVY },
    { label: 'Rehab estimate', value: usd(n(r.rehab)) },
    { label: 'Max allowable offer', value: usd(mao) },
    { label: 'Monthly rent', value: usd(n(r.monthlyRent)) },
    { label: 'Monthly cash flow', value: usd(n(r.monthlyCashFlow)), accent: EMERALD7 },
    { label: 'Cap rate', value: pct(n(r.capRate)) },
    { label: 'Cash-on-cash', value: pct(n(r.cashOnCash)), accent: EMERALD7 },
  ])

  y = sectionTitle(doc, y, 'Strategy comparison')
  y = table(doc, y, [
    { label: 'Strategy', key: 'name', x: M, w: 240 },
    { label: 'ROI', key: 'roi', x: 320, w: 90, align: 'right' },
    { label: 'Est. profit', key: 'profit', x: 430, w: 134, align: 'right' },
  ], d.strategies.map((s) => ({ name: s.name, roi: pct(n(s.roi)), profit: usd(n(s.profit)) })))

  y = sectionTitle(doc, y, 'Rehab budget')
  y = table(doc, y, [
    { label: 'Item', key: 'item', x: M, w: 360 },
    { label: 'Cost', key: 'cost', x: 408, w: 156, align: 'right' },
  ], d.rehab.map((it) => ({ item: it.item, cost: usd(n(it.cost)) })))
  const total = d.rehab.reduce((a, b) => a + n(b.cost), 0)
  y = ensure(doc, y, 30)
  doc.setFillColor(...SOFT); doc.roundedRect(M, y, RIGHT - M, 24, 4, 4, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...NAVY)
  doc.text('Total rehab estimate', M + 12, y + 16)
  doc.text(usd(total), RIGHT - 12, y + 16, { align: 'right' })
  y += 24 + 18

  y = sectionTitle(doc, y, 'Comparable sales')
  y = table(doc, y, [
    { label: 'Address', key: 'address', x: M, w: 230 },
    { label: 'Sold', key: 'sold', x: 300, w: 70, align: 'right' },
    { label: 'Sqft', key: 'sqft', x: 378, w: 56, align: 'right' },
    { label: 'Bd/Ba', key: 'bdba', x: 446, w: 44 },
    { label: 'Dist', key: 'dist', x: 500, w: 64, align: 'right' },
  ], d.comps.map((c) => ({
    address: c.address,
    sold: usd(n(c.sold)),
    sqft: n(c.sqft) ? n(c.sqft).toLocaleString() : '—',
    bdba: `${c.beds ?? '–'}/${c.baths ?? '–'}`,
    dist: c.dist != null ? `${c.dist} mi` : '—',
  })))

  y = sectionTitle(doc, y, 'Risk profile')
  d.risks.forEach((rk) => {
    y = ensure(doc, y, 18)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(...INK)
    doc.text(rk.label, M, y)
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...(RISK[rk.level] || INK5))
    doc.text(String(rk.level), RIGHT, y, { align: 'right' })
    y += 8; doc.setDrawColor(240, 243, 247); doc.line(M, y, RIGHT, y); y += 10
  })
  y += 6

  if (r.tier === 'deal-intelligence') {
    y = sectionTitle(doc, y, 'Executive memo')
    const memo = r.memo || `${r.address} presents a ${String(r.verdict || '').toLowerCase()} opportunity. Acquired at ${usd(n(r.purchasePrice))} with a ${usd(n(r.rehab))} renovation against a ${usd(n(r.arv))} ARV. Recommendation: proceed at or below the max allowable offer of ${usd(mao)}.`
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...INK)
    doc.splitTextToSize(memo, RIGHT - M).forEach((ln) => { y = ensure(doc, y, 14); doc.text(ln, M, y); y += 14 })
  }

  y = preparedBy(doc, y, opts.contact)

  footers(doc, 'Estimates for informational purposes only. Verify all figures before making an offer. Not financial advice.')
  doc.save(`PropScope-Report-${slug(r.address)}.pdf`)
}

// ================= Seller summary =================
export function downloadSellerSummary(r, opts = {}) {
  if (!r) return
  const includeRepairs = opts.includeRepairs !== false
  const contact = opts.contact
  const d = reportDetail(r)
  const mao = Math.round(n(r.arv) * 0.7 - n(r.rehab))
  const doc = newDoc()
  let y = header(doc, 'Seller Summary')

  doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(...NAVY)
  doc.text('How we reached our offer', M, y); y += 18
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(...INK5)
  doc.text(`${r.address || ''}, ${r.city || ''}, ${r.state || ''} ${r.zip || ''}`.trim(), M, y); y += 24

  const para = `Fully renovated, this home would be worth about ${usd(n(r.arv))}, based on recent sales of similar nearby homes. In its current condition it needs an estimated ${usd(n(r.rehab))} in repairs and updates. After that work, holding and closing costs, and a modest return, our offer comes to ${usd(mao)}.`
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(...INK)
  const lines = doc.splitTextToSize(para, RIGHT - M)
  doc.text(lines, M, y); y += lines.length * 15 + 16

  // offer boxes
  const boxW = (RIGHT - M - 24) / 3, h = 56
  const boxes = [
    ['After-repair value', usd(n(r.arv)), NAVY, SOFT],
    ['Estimated repairs', usd(n(r.rehab)), INK, SOFT],
    ['Our offer', usd(mao), EMERALD7, [236, 253, 245]],
  ]
  boxes.forEach((b, i) => {
    const x = M + i * (boxW + 12)
    doc.setFillColor(...b[3]); doc.roundedRect(x, y, boxW, h, 4, 4, 'F')
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...INK5)
    doc.text(b[0], x + 10, y + 18)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(...b[2])
    doc.text(String(b[1]), x + 10, y + 40)
  })
  y += h + 22

  if (includeRepairs) {
    y = sectionTitle(doc, y, 'Estimated repair summary')
    const groups = groupRehab(d.rehab)
    y = table(doc, y, [
      { label: 'Category', key: 'label', x: M, w: 380 },
      { label: 'Estimate', key: 'cost', x: 430, w: 134, align: 'right' },
    ], groups.map((g) => ({ label: g.label, cost: usd(g.cost) })))
    const rtotal = groups.reduce((a, b) => a + b.cost, 0)
    y = ensure(doc, y, 30)
    doc.setFillColor(...SOFT); doc.roundedRect(M, y, RIGHT - M, 24, 4, 4, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...NAVY)
    doc.text('Total estimated repairs', M + 12, y + 16)
    doc.text(usd(rtotal), RIGHT - 12, y + 16, { align: 'right' })
    y += 24 + 18
  }

  y = sectionTitle(doc, y, 'Comparable sales this is based on')
  y = table(doc, y, [
    { label: 'Address', key: 'address', x: M, w: 380 },
    { label: 'Sold', key: 'sold', x: 430, w: 134, align: 'right' },
  ], d.comps.map((c) => ({ address: c.address, sold: usd(n(c.sold)) })))

  y = preparedBy(doc, y, contact)

  footers(doc, 'Figures are estimates to support discussion — not a formal appraisal, and not a binding offer.')
  doc.save(`PropScope-Seller-Summary-${slug(r.address)}.pdf`)
}
