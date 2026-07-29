import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, FilePlus2, CheckCircle2, X, Loader2 } from 'lucide-react'
import PageHeader from '../../components/portal/PageHeader.jsx'
import ReportCard from '../../components/portal/ReportCard.jsx'
import { listReports } from '../../lib/reports.js'

const filters = ['All', 'Strong', 'Moderate', 'Thin']

export default function Reports() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('All')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const showBanner = params.get('new') === '1'

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await listReports()
        if (active) setReports(data)
      } catch (err) {
        if (active) setError((err && err.message) || 'Could not load your reports.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  const results = useMemo(() => {
    return reports.filter((r) => {
      const matchQ = `${r.address} ${r.city} ${r.state} ${r.strategy}`.toLowerCase().includes(q.toLowerCase())
      const matchF = filter === 'All' || r.verdict === filter
      return matchQ && matchF
    })
  }, [q, filter, reports])

  return (
    <>
      <PageHeader title="Reports" subtitle="Every deal you've analyzed."
        action={<Link to="/app/new" className="btn-primary"><FilePlus2 size={16} /> New analysis</Link>} />

      {showBanner && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
          <span className="flex items-center gap-2"><CheckCircle2 size={18} /> Report generated — you'll find it below.</span>
          <button onClick={() => setParams({})} className="text-emerald-600 hover:text-emerald-800"><X size={16} /></button>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input className="input pl-9" placeholder="Search address or strategy…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === f ? 'bg-brand-600 text-white' : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50'
              }`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card grid place-items-center py-16 text-center">
          <Loader2 size={22} className="animate-spin text-brand-600" />
          <p className="mt-3 text-ink-500">Loading your reports…</p>
        </div>
      ) : error ? (
        <div className="card grid place-items-center py-16 text-center">
          <p className="text-rose-600">{error}</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="card grid place-items-center py-16 text-center">
          <p className="text-ink-700 font-medium">No reports yet</p>
          <p className="mt-1 text-ink-500">Run your first deal analysis to see it here.</p>
          <Link to="/app/new" className="btn-primary mt-5"><FilePlus2 size={16} /> New analysis</Link>
        </div>
      ) : results.length === 0 ? (
        <div className="card grid place-items-center py-16 text-center">
          <p className="text-ink-500">No reports match your search.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => <ReportCard key={r.id} r={r} />)}
        </div>
      )}
    </>
  )
}
