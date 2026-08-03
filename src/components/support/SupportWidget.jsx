import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Mail, Mic } from 'lucide-react'

const SUPPORT_EMAIL = 'support@getpropscope.com'
const GREETING = "Hi! I'm the PropScope assistant. Ask me anything about how PropScope works, pricing, your reports, or billing."

export default function SupportWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const endRef = useRef(null)
  const recRef = useRef(null)
  const supportsVoice = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    if (listening) { try { recRef.current?.stop() } catch (e) {} }
    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(1).map((m) => ({ role: m.role, content: m.content })) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.reply) throw new Error(data.error || 'no reply')
      setMessages([...next, { role: 'assistant', content: data.reply }])
    } catch (e) {
      setMessages([...next, {
        role: 'assistant',
        content: `Sorry — I'm having trouble responding right now. Please email us at ${SUPPORT_EMAIL} and we'll get back to you shortly.`,
      }])
    } finally {
      setLoading(false)
    }
  }

  const toggleMic = () => {
    if (!supportsVoice) return
    if (listening) { try { recRef.current?.stop() } catch (e) {} ; return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.continuous = false
    rec.onresult = (e) => {
      const t = Array.from(e.results).map((r) => r[0].transcript).join(' ').trim()
      if (t) setInput((prev) => (prev ? prev.trim() + ' ' : '') + t)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recRef.current = rec
    setListening(true)
    try { rec.start() } catch (e) { setListening(false) }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Support chat"
        className="fixed bottom-5 right-5 z-[60] grid h-14 w-14 place-items-center rounded-full bg-[#213f66] text-white shadow-lg transition hover:bg-[#0b2447]"
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-[60] flex h-[520px] w-[360px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-[#213f66] px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">PropScope Support</p>
              <p className="text-xs text-blue-100/80">AI assistant · replies instantly</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-blue-100 hover:text-white"><X size={18} /></button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-ink-50 p-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.role === 'user' ? 'bg-[#213f66] text-white' : 'bg-white text-ink-700 ring-1 ring-ink-200'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-3 py-2 text-ink-400 ring-1 ring-ink-200"><Loader2 size={16} className="animate-spin" /></div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-ink-200 bg-white p-2">
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder={listening ? 'Listening… speak now' : 'Type or tap the mic to speak…'}
                className="max-h-24 flex-1 resize-none rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 outline-none focus:border-[#213f66]"
              />
              {supportsVoice && (
                <button onClick={toggleMic} title={listening ? 'Stop listening' : 'Speak your question'}
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition ${listening ? 'bg-rose-600 text-white animate-pulse' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}>
                  <Mic size={16} />
                </button>
              )}
              <button onClick={send} disabled={loading || !input.trim()} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:opacity-40">
                <Send size={16} />
              </button>
            </div>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-2 flex items-center justify-center gap-1.5 text-xs text-ink-400 transition hover:text-[#213f66]">
              <Mail size={12} /> Prefer email? {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      )}
    </>
  )
}
