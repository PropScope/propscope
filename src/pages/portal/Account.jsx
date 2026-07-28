import { useState } from 'react'
import { Check } from 'lucide-react'
import PageHeader from '../../components/portal/PageHeader.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { dateFmt } from '../../lib/format.js'

export default function Account() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', company: user?.company || '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const save = (e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2500) }

  return (
    <>
      <PageHeader title="Account" subtitle="Manage your profile and preferences." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold text-ink-900">Profile</h3>
          <form onSubmit={save} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">Full name</label><input className="input" value={form.name} onChange={set('name')} /></div>
              <div><label className="label">Company</label><input className="input" value={form.company} onChange={set('company')} /></div>
            </div>
            <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={set('email')} /></div>
            <div className="flex items-center gap-3">
              <button className="btn-primary">Save changes</button>
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
            <h3 className="font-semibold text-ink-900">Security</h3>
            <button className="btn-secondary mt-4 w-full">Change password</button>
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
