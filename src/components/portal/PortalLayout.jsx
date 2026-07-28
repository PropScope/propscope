import { useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FilePlus2, FileBarChart2, CreditCard, User2,
  LogOut, Menu, X, Plus, Sparkles,
} from 'lucide-react'
import Logo from '../ui/Logo.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { planById } from '../../lib/plans.js'

const nav = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/new', label: 'New analysis', icon: FilePlus2 },
  { to: '/app/reports', label: 'Reports', icon: FileBarChart2 },
  { to: '/app/billing', label: 'Billing', icon: CreditCard },
  { to: '/app/account', label: 'Account', icon: User2 },
]

export default function PortalLayout() {
  const { user, logout } = useAuth()
  const nav2 = useNavigate()
  const [open, setOpen] = useState(false)
  const plan = planById(user?.plan)

  const doLogout = () => { logout(); nav2('/') }

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-ink-200 bg-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-ink-100 px-5">
          <Logo />
          <button className="lg:hidden text-ink-500" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'
                }`}>
              <n.icon size={18} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-3 bottom-3">
          <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 p-4 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles size={15} /> {plan?.name}</div>
            <p className="mt-1 text-xs text-brand-50/90">
              {plan?.subscription ? 'Unlimited reports active' : 'Per-report plan'}
            </p>
            <Link to="/app/billing" className="mt-3 block rounded-lg bg-white/15 px-3 py-1.5 text-center text-xs font-semibold hover:bg-white/25">
              Manage plan
            </Link>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-ink-900/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-200 bg-white/85 px-5 backdrop-blur">
          <button className="lg:hidden text-ink-600" onClick={() => setOpen(true)}><Menu size={22} /></button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <Link to="/app/new" className="btn-primary hidden sm:inline-flex"><Plus size={16} /> New analysis</Link>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {user?.avatarInitials}
              </div>
              <div className="hidden text-sm sm:block">
                <p className="font-medium text-ink-900 leading-tight">{user?.name}</p>
                <p className="text-xs text-ink-400 leading-tight">{user?.company}</p>
              </div>
            </div>
            <button onClick={doLogout} className="btn-ghost p-2" title="Log out"><LogOut size={18} /></button>
          </div>
        </header>

        <main className="p-5 sm:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
