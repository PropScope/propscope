import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, FilePlus2, CheckCircle2, X } from 'lucide-react'
import PageHeader from '../../components/portal/PageHeader.jsx'
import ReportCard from '../../components/portal/ReportCard.jsx'
import { SAMPLE_REPORTS } from '../../lib/mockData.js'

const filters = ['All', 'Strong', 'Moderate', 'Thin', 'Generating']

export default function Reports() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('All')
  const showBanner = params.get('new') === '1'

  const results = useMemo(() => {
    return SAMPLE_REPORTS.filter((r) => {
      const matchQ = `${r.address} ${r.city} ${r.state} ${r.strategy}`.toLowerCase().includes(q.toLowerCase())
      const matchF =
        filter === 'All' ||
        (filter === 'Generating' && r.status === 'generating') ||
        r.verdict === filter
      return matchQ && matchF
    })
  }, [q, filter])

  return (
    <>
      <PageHeader title="Reports" subtitle="Every deal you've analyzed."
        action={<Link to="/app/new" className="btn-primary"><FilePlus2 size={16} /> New analysis</Link>} />

      {showBanner && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
          <span className="flex items-center gap-2"><CheckCircle2 size={18} /> Deal submitted — your report is generating and will appear here shortly.</span>
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

      {results.length === 0 ? (
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
