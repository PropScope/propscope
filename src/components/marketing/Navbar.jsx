import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from '../ui/Logo.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const links = [
  { to: '/features', label: 'Features' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/faq', label: 'FAQ' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthed } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-white/85 backdrop-blur">
      <nav className="container-x flex h-16 items-center justify-between">
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'text-brand-700' : 'text-ink-600 hover:text-ink-900'
                }`}>
              {l.label}
            </NavLink>
          ))}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {isAuthed ? (
            <Link to="/app" className="btn-primary">Go to portal</Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Log in</Link>
              <Link to="/signup" className="btn-primary">Get started</Link>
            </>
          )}
        </div>
        <button className="md:hidden p-2 text-ink-700" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink-200 bg-white md:hidden">
          <div className="container-x flex flex-col gap-1 py-3">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 flex gap-2 px-1">
              <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary flex-1">Log in</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="btn-primary flex-1">Get started</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
