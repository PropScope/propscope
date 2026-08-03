import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, LogOut } from 'lucide-react'
import PageHeader from '../../components/portal/PageHeader.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { dateFmt } from '../../lib/format.js'
import ThemeToggle from '../../components/ui/ThemeToggle.jsx'

export default function Account() {
  const { user, updateProfile, logout } = useAuth()
  const nav = useNavigate()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: user?.name || '',
    company: user?.company && user.company !== '—' ? user.company : '',
    phone: user?.phone || '',
    email: user?.email || '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const save = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await updateProfile({ name: form.name, company: form.company, phone: form.phone })
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError((err && err.message) || 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Account" subtitle="Manage your profile and preferences." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold text-ink-900">Profile</h3>
          <form onSubmit={save} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">Full name</label><input className="input" value={form.name} onChange={set('name')} /></div>
              <div><label className="label">Company</label><input className="input" placeholder="Your company (optional)" value={form.company} onChange={set('company')} /></div>
              <div><label className="label">Phone</label><input className="input" placeholder="(555) 123-4567" value={form.phone} onChange={set('phone')} /></div>
              <div><label className="label">Email</label><input type="email" className="input opacity-60 cursor-not-allowed" value={form.email} disabled /></div>
            </div>
            <p className="text-xs text-ink-400">Your name, company, and phone can appear on the reports you share. Email is tied to your login and can't be changed here.</p>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <div className="flex items-center gap-3">
              <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
              {saved && <span className="flex items-center gap-1 text-sm text-emerald-600"><Check size={16} /> Saved</span>}
            </div>
          </form>

          <hr className="my-6 border-ink-100" />
          <h3 className="font-semibold text-ink-900">Notifications</h3>
          <div className="mt-4 space-y-3">
            {[['Report completed', true], ['Weekly deal summary', true], ['Product updates', false]].map(([t, on]) => (
              <Toggle key={t} label={t} defaultOn={on} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
              {user?.avatarInitials}
            </div>
            <p className="mt-3 font-semibold text-ink-900">{user?.name}</p>
            <p className="text-sm text-ink-500">{user?.email}</p>
            <p className="mt-2 text-xs text-ink-400">Member since {dateFmt(user?.memberSince)}</p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-ink-900">Appearance</h3>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-800">Dark mode</p>
                <p className="text-xs text-ink-400">Easier on the eyes at night</p>
              </div>
              <ThemeToggle className="ring-1 ring-ink-200" />
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-ink-900">Account &amp; security</h3>
            <button onClick={() => { logout(); nav('/') }} className="btn-secondary mt-4 w-full"><LogOut size={16} /> Log out</button>
            <button className="btn-secondary mt-2 w-full">Change password</button>
            <button className="btn-ghost mt-2 w-full text-rose-600 hover:bg-rose-50">Delete account</button>
          </div>
        </div>
      </div>
    </>
  )
}

function Toggle({ label, defaultOn }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-700">{label}</span>
      <button onClick={() => setOn((v) => !v)}
        className={`relative h-6 w-11 rounded-full transition ${on ? 'bg-brand-600' : 'bg-ink-200'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  )
}
