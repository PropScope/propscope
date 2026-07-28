import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function AnnouncementBar() {
  return (
    <div className="bg-ink-900 text-white">
      <div className="container-x flex items-center justify-center gap-2 py-2 text-center text-xs sm:text-sm">
        <Sparkles size={14} className="text-brand-400 shrink-0" />
        <span className="text-ink-200">
          New: <span className="font-semibold text-white">BRRRR analysis + executive memo</span> now in every Deal Intelligence report.
        </span>
        <Link to="/pricing" className="hidden items-center gap-1 font-semibold text-brand-300 hover:text-brand-200 sm:inline-flex">
          See plans <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  )
}
