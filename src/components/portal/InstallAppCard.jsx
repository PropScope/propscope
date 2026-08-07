import { useEffect, useState } from 'react'
import { Smartphone, Download, Share, X } from 'lucide-react'

// Shown to logged-in users in the dashboard: prompt to install PropScope to the phone home screen.
// Android/desktop Chrome: one-tap native install. iOS Safari: quick "Add to Home Screen" steps.
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
  const isSafari = isIOS && /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua)

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
    try {
      prompt.prompt()
      await prompt.userChoice
    } catch (e) {}
    window.__psInstallPrompt = null
    setPrompt(null)
  }

  // Nothing to show if already installed, dismissed, or there's no way to install here.
  if (installed || isStandalone || dismissed) return null
  const canAndroid = !!prompt
  if (!canAndroid && !isIOS) return null

  return (
    <div className="mb-6 flex items-start gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-4 sm:p-5 text-ink-800 psportal-install">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
        <Smartphone size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-ink-900">Get PropScope on your phone</h3>
        {canAndroid ? (
          <>
            <p className="mt-1 text-sm text-ink-600">Install it like an app — a home-screen icon that opens full-screen. Your login and plan carry over.</p>
            <button onClick={install} className="btn-primary mt-3">
              <Download size={16} /> Install app
            </button>
          </>
        ) : (
          <p className="mt-1 text-sm text-ink-600">
            In Safari, tap the <Share size={14} className="mx-0.5 inline align-text-bottom" /> <b>Share</b> button, then choose <b>“Add to Home Screen.”</b> You'll get a PropScope icon that opens full-screen — your login and plan carry over.
          </p>
        )}
      </div>
      <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 rounded-lg p-1 text-ink-400 hover:bg-brand-100 hover:text-ink-600">
        <X size={16} />
      </button>
    </div>
  )
}
