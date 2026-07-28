import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Loader2, Home, DollarSign, Wrench, Target, Sparkles } from 'lucide-react'
import PageHeader from '../../components/portal/PageHeader.jsx'
import { PLANS } from '../../lib/plans.js'
import { usd } from '../../lib/format.js'

const steps = ['Property', 'Numbers', 'Strategy', 'Report tier']
const strategies = ['Fix & Flip', 'Buy & Hold', 'BRRRR', 'Not sure — recommend one']

export default function NewDeal() {
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    address: '', city: '', state: '', zip: '', beds: '', baths: '', sqft: '', year: '',
    purchasePrice: '', rehab: '', rent: '', arv: '',
    strategy: 'BRRRR', tier: 'deal-analyzer', notes: '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const submit = async () => {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1400))
    setSubmitting(false)
    nav('/app/reports?new=1')
  }

  return (
    <>
      <PageHeader title="New deal analysis" subtitle="Tell us about the property and we'll build the report." />

      {/* Stepper */}
      <div className="mb-8 flex items-center">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${
                i < step ? 'bg-brand-600 text-white' : i === step ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-ink-200 text-ink-500'
              }`}>{i < step ? <Check size={15} /> : i + 1}</span>
              <span className={`hidden text-sm font-medium sm:block ${i <= step ? 'text-ink-900' : 'text-ink-400'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`mx-3 h-0.5 flex-1 ${i < step ? 'bg-brand-600' : 'bg-ink-200'}`} />}
          </div>
        ))}
      </div>

      <div className="card p-6 sm:p-8">
        {step === 0 && (
          <Fieldset icon={Home} title="Property details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Street address" className="sm:col-span-2"><input className="input" placeholder="4821 Maple Grove Dr" value={form.address} onChange={set('address')} /></Field>
              <Field label="City"><input className="input" placeholder="Columbus" value={form.city} onChange={set('city')} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="State"><input className="input" placeholder="OH" value={form.state} onChange={set('state')} /></Field>
                <Field label="ZIP"><input className="input" placeholder="43229" value={form.zip} onChange={set('zip')} /></Field>
              </div>
              <Field label="Beds"><input className="input" placeholder="3" value={form.beds} onChange={set('beds')} /></Field>
              <Field label="Baths"><input className="input" placeholder="2" value={form.baths} onChange={set('baths')} /></Field>
              <Field label="Square feet"><input className="input" placeholder="1,480" value={form.sqft} onChange={set('sqft')} /></Field>
              <Field label="Year built"><input className="input" placeholder="1996" value={form.year} onChange={set('year')} /></Field>
            </div>
          </Fieldset>
        )}

        {step === 1 && (
          <Fieldset icon={DollarSign} title="Your numbers" hint="Leave anything blank and PropScope will estimate it.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Purchase price"><input className="input" placeholder="$142,000" value={form.purchasePrice} onChange={set('purchasePrice')} /></Field>
              <Field label="Estimated ARV"><input className="input" placeholder="Estimate for me" value={form.arv} onChange={set('arv')} /></Field>
              <Field label="Rehab budget"><input className="input" placeholder="$41,000" value={form.rehab} onChange={set('rehab')} /></Field>
              <Field label="Expected monthly rent"><input className="input" placeholder="Estimate for me" value={form.rent} onChange={set('rent')} /></Field>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
              <Sparkles size={18} className="mt-0.5 shrink-0" />
              Don't have every number? That's fine — our engine fills the gaps using comps and market data.
            </div>
          </Fieldset>
        )}

        {step === 2 && (
          <Fieldset icon={Target} title="Investment strategy">
            <div className="grid gap-3 sm:grid-cols-2">
              {strategies.map((s) => (
                <button key={s} type="button" onClick={() => setForm((f) => ({ ...f, strategy: s }))}
                  className={`rounded-xl border p-4 text-left text-sm transition ${
                    form.strategy === s ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-ink-200 hover:border-ink-300'
                  }`}>
                  <span className="font-semibold text-ink-900">{s}</span>
                </button>
              ))}
            </div>
            <Field label="Notes for the analysis (optional)" className="mt-4">
              <textarea rows={3} className="input" placeholder="Anything specific you want the report to weigh?" value={form.notes} onChange={set('notes')} />
            </Field>
          </Fieldset>
        )}

        {step === 3 && (
          <Fieldset icon={Wrench} title="Choose your report tier">
            <div className="grid gap-3">
              {PLANS.filter((p) => !p.subscription).map((p) => (
                <button key={p.id} type="button" onClick={() => setForm((f) => ({ ...f, tier: p.id }))}
                  className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                    form.tier === p.id ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-ink-200 hover:border-ink-300'
                  }`}>
                  <div>
                    <p className="font-semibold text-ink-900">{p.name}</p>
                    <p className="text-sm text-ink-500">{p.tagline}</p>
                  </div>
                  <span className="text-lg font-bold text-ink-900">{usd(p.price)}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-400">On Investor Pro, reports are included — no per-report charge.</p>
          </Fieldset>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-ink-100 pt-6">
          <button onClick={back} disabled={step === 0} className="btn-secondary disabled:opacity-40">
            <ArrowLeft size={16} /> Back
          </button>
          {step < steps.length - 1 ? (
            <button onClick={next} className="btn-primary">Continue <ArrowRight size={16} /></button>
          ) : (
            <button onClick={submit} disabled={submitting} className="btn-primary">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting deal…</> : <>Generate report <Sparkles size={16} /></>}
            </button>
          )}
        </div>
      </div>
    </>
  )
}

function Fieldset({ icon: Icon, title, hint, children }) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon size={20} /></span>
        <div>
          <h3 className="font-semibold text-ink-900">{title}</h3>
          {hint && <p className="text-sm text-ink-500">{hint}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}
function Field({ label, className = '', children }) {
  return <div className={className}><label className="label">{label}</label>{children}</div>
}
