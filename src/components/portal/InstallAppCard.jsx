import { useEffect, useState } from 'react'
import { Smartphone, Download, Share, X, MoreVertical } from 'lucide-react'

// Small brand crosshair mark used beside the QR.
function Crosshair({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0EA5A0" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="8" /><line x1="12" y1="1" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="23" />
      <line x1="1" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="23" y2="12" />
      <circle cx="12" cy="12" r="1.6" fill="#0EA5A0" stroke="none" />
    </svg>
  )
}

// Shown to logged-in users: install PropScope to the phone home screen.
// Desktop: a QR code to scan with your phone. Android: one-tap native install. iOS Safari: Add-to-Home-Screen steps.
export default function InstallAppCard() {
  const [prompt, setPrompt] = useState(() => (typeof window !== 'undefined' ? window.__psInstallPrompt || null : null))
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('ps-install-dismissed') === '1' } catch (e) { return false }
  })
  const [installed, setInstalled] = useState(false)

  const isStandalone = typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true)
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const isIOS = /iphone|ipad|ipod/i.test(ua)
  const isAndroid = /android/i.test(ua)
  const isMobile = isIOS || isAndroid

  useEffect(() => {
    const onAvail = () => setPrompt(window.__psInstallPrompt || null)
    const onInstalled = () => setInstalled(true)
    window.addEventListener('ps-installable', onAvail)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('ps-installable', onAvail)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const dismiss = () => {
    setDismissed(true)
    try { localStorage.setItem('ps-install-dismissed', '1') } catch (e) {}
  }

  const install = async () => {
    if (!prompt) return
    try { prompt.prompt(); await prompt.userChoice } catch (e) {}
    window.__psInstallPrompt = null
    setPrompt(null)
  }

  if (installed || isStandalone || dismissed) return null

  const DismissBtn = (
    <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 rounded-lg p-1 text-ink-400 hover:bg-brand-100 hover:text-ink-600">
      <X size={16} />
    </button>
  )

  // ---------- DESKTOP: show a QR to get it on the phone ----------
  if (!isMobile) {
    return (
      <div className="mb-6 flex items-center gap-5 rounded-2xl border border-brand-200 bg-brand-50 p-5 text-ink-800 psportal-install">
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
            <Smartphone size={16} className="text-brand-600" /> Get PropScope on your phone
          </h3>
          <p className="mt-1 max-w-md text-sm text-ink-600">
            Point your phone's camera at the code to open PropScope, then add it to your home screen. It opens full-screen like an app, and your login &amp; plan carry over.
          </p>
        </div>
        <div className="shrink-0 rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-ink-100">
          <div className="mb-1 flex items-center justify-center gap-1.5">
            <Crosshair size={14} />
            <span className="text-[11px] font-bold text-ink-900">Prop<span className="text-brand-600">Scope</span></span>
          </div>
          <img src="/install-qr.png" alt="Scan to open PropScope on your phone" width="116" height="116" className="block h-[116px] w-[116px]" />
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-ink-400">Scan to install</p>
        </div>
        {DismissBtn}
      </div>
    )
  }

  // ---------- MOBILE: install straight to the home screen ----------
  return (
    <div className="mb-6 flex items-start gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-ink-800 psportal-install sm:p-5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
        <Smartphone size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-ink-900">Get PropScope on your phone</h3>
        {isAndroid && prompt ? (
          <>
            <p className="mt-1 text-sm text-ink-600">Install it like an app — a home-screen icon that opens full-screen. Your login and plan carry over.</p>
            <button onClick={install} className="btn-primary mt-3"><Download size={16} /> Install app</button>
          </>
        ) : isIOS ? (
          <p className="mt-1 text-sm text-ink-600">
            In Safari, tap the <Share size={14} className="mx-0.5 inline align-text-bottom" /> <b>Share</b> button, then choose <b>&ldquo;Add to Home Screen.&rdquo;</b> You'll get a PropScope icon that opens full-screen — your login and plan carry over.
          </p>
        ) : (
          <p className="mt-1 text-sm text-ink-600">
            Tap the <MoreVertical size={14} className="mx-0.5 inline align-text-bottom" /> menu in your browser, then choose <b>&ldquo;Install app&rdquo;</b> (or &ldquo;Add to Home screen&rdquo;). Your login and plan carry over.
          </p>
        )}
      </div>
      {DismissBtn}
    </div>
  )
}
