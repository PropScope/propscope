import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Loader2, Home, DollarSign, Target, Sparkles, Lock } from 'lucide-react'
import PageHeader from '../../components/portal/PageHeader.jsx'
import { planById, capForPlan } from '../../lib/plans.js'
import { generateReport, reportCount, monthlyReportCount } from '../../lib/reports.js'
import { useAuth } from '../../context/AuthContext.jsx'

const steps = ['Property', 'Numbers', 'Strategy']
const strategies = ['Fix & Flip', 'Buy & Hold', 'BRRRR', 'Not sure — recommend one']

export default function NewDeal() {
  const nav = useNavigate()
  const { user } = useAuth()
  const plan = planById(user?.plan)
  const cap = capForPlan(user?.plan)
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [usage, setUsage] = useState(null) // { total, month }
  const [form, setForm] = useState({
    address: '', city: '', state: '', zip: '', beds: '', baths: '', sqft: '', year: '',
    purchasePrice: '', rehab: '', rent: '', arv: '',
    strategy: 'BRRRR', notes: '', noPrice: false, rehabScope: 'ai',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  useEffect(() => {
    let live = true
    Promise.all([reportCount(), monthlyReportCount()])
      .then(([total, month]) => { if (live) setUsage({ total, month }) })
      .catch(() => { if (live) setUsage({ total: 1, month: 0 }) })
    return () => { live = false }
  }, [])

  const freeAvail = !!usage && usage.total === 0
  const withinCap = !!plan && !!usage && usage.month < cap
  const canGenerate = freeAvail || withinCap
  const priceOk = !!String(form.purchasePrice).trim() || form.noPrice

  const buildIntake = () => ({
    address: form.address, city: form.city, state: form.state, zip: form.zip,
    beds: form.beds, baths: form.baths, sqft: form.sqft, year: form.year,
    purchasePrice: form.purchasePrice, rehab: form.rehab, rent: form.rent, arv: form.arv,
    strategy: form.strategy, notes: form.notes, rehabScope: form.rehabScope,
    tier: plan ? plan.id : 'deal-check',
  })

  const submit = async () => {
    setSubmitting(true); setError('')
    try {
      const report = await generateReport(buildIntake())
      nav(`/app/reports/${report.id}`)
    } catch (err) {
      setError((err && err.message) || 'Something went wrong.')
      setSubmitting(false)
    }
  }

  const usageNote = () => {
    if (!usage) return 'Checking your plan…'
    if (freeAvail) return 'Your first report is on us — free, no card required.'
    if (plan) return `${usage.month} of ${cap} reports used this month on ${plan.name}.`
    return 'Your free report has been used. Choose a plan to keep analyzing deals.'
  }

  return (
    <>
      <PageHeader title="New deal analysis" subtitle="Tell us about the property and we'll build the report." />

      <div className={`mb-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
        canGenerate ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
      }`}>
        {canGenerate ? <Sparkles size={16} /> : <Lock size={16} />} {usageNote()}
      </div>

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
          <Fieldset icon={DollarSign} title="Your numbers" hint="Enter a sale price — or check the box if you don't know it yet. The rest is optional.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Sale price {!form.noPrice && <span className="text-rose-500">*</span>}</label>
                <input className="input disabled:bg-ink-50 disabled:text-ink-400" placeholder="$142,000" inputMode="numeric"
                  value={form.purchasePrice} onChange={set('purchasePrice')} disabled={form.noPrice} />
                <label className="mt-2 flex cursor-pointer select-none items-center gap-2 text-sm text-ink-600">
                  <input type="checkbox" checked={form.noPrice}
                    onChange={(e) => setForm((f) => ({ ...f, noPrice: e.target.checked, purchasePrice: e.target.checked ? '' : f.purchasePrice }))}
                    className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
                  I don't know the sale price yet — estimate it for me
                </label>
              </div>
              <Field label="Estimated ARV"><input className="input" placeholder="Estimate for me" value={form.arv} onChange={set('arv')} /></Field>
              <Field label="Rehab budget"><input className="input" placeholder="Estimate for me" value={form.rehab} onChange={set('rehab')} /></Field>
              <Field label="Expected monthly rent"><input className="input" placeholder="Estimate for me" value={form.rent} onChange={set('rent')} /></Field>
            </div>

            <div className="mt-5">
              <label className="label">Property condition — how much work does it need?</label>
              <div className="mt-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ['ai', 'Let AI estimate', "We'll infer it from the data"],
                  ['cosmetic', 'Cosmetic', 'Paint, floors, fixtures'],
                  ['moderate', 'Moderate', 'Kitchen, baths & systems'],
                  ['gut', 'Full gut', 'Down to the studs'],
                ].map(([val, title, desc]) => (
                  <button key={val} type="button" onClick={() => setForm((f) => ({ ...f, rehabScope: val }))}
                    className={`rounded-xl border p-3 text-left transition ${
                      form.rehabScope === val ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-ink-200 hover:border-ink-300'
                    }`}>
                    <span className="block text-sm font-semibold text-ink-900">{title}</span>
                    <span className="mt-0.5 block text-xs text-ink-500">{desc}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-400">This is the one call only you can make from the photos — the AI sizes the rehab from your pick, the square footage, and local costs. A rehab number typed above overrides this.</p>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
              <Sparkles size={18} className="mt-0.5 shrink-0" />
              ARV, rehab and rent are optional — leave them blank and our engine estimates from comps and market data. You can fine-tune every number on the report afterward.
            </div>
            {!priceOk && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
                Enter a sale price, or check "I don't know the sale price yet" to continue.
              </div>
            )}
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

            {!canGenerate && usage && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                {plan
                  ? `You've used all ${cap} reports on ${plan.name} this month. Upgrade to a higher plan to run more — or they reset next month.`
                  : 'Your free report has been used. Subscribe to a plan to keep running deal analyses.'}
              </div>
            )}
          </Fieldset>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}
        {submitting && (
          <p className="mt-6 text-center text-sm text-ink-500">Analyzing the property and building your report — this usually takes 10–20 seconds.</p>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-ink-100 pt-6">
          <button onClick={back} disabled={step === 0} className="btn-secondary disabled:opacity-40">
            <ArrowLeft size={16} /> Back
          </button>
          {step < steps.length - 1 ? (
            <button onClick={next} disabled={step === 1 && !priceOk} className="btn-primary disabled:opacity-40">Continue <ArrowRight size={16} /></button>
          ) : canGenerate ? (
            <button onClick={submit} disabled={submitting || !usage} className="btn-primary">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Working…</> : <>{freeAvail ? 'Generate free report' : 'Generate report'} <Sparkles size={16} /></>}
            </button>
          ) : (
            <Link to="/app/billing" className="btn-primary">Choose a plan <ArrowRight size={16} /></Link>
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
