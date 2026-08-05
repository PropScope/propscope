import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Mail, Mic } from 'lucide-react'

const SUPPORT_EMAIL = 'support@getpropscope.com'
const GREETING = "Hi! I'm the PropScope assistant. Ask me anything about how PropScope works, pricing, your reports, or billing."

// The widget is mounted at the app root (outside the portal's dark-mode scope),
// so it detects dark mode itself and applies dark colors directly.
function useDark() {
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'))
  useEffect(() => {
    if (typeof document === 'undefined') return
    const el = document.documentElement
    const update = () => setDark(el.classList.contains('dark'))
    update()
    const obs = new MutationObserver(update)
    obs.observe(el, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onloadend = () => resolve(String(r.result || '').split(',')[1] || '')
    r.onerror = reject
    r.readAsDataURL(blob)
  })

export default function SupportWidget() {
  const dark = useDark()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [micError, setMicError] = useState('')
  const endRef = useRef(null)

  // Accurate path: record audio → ElevenLabs Scribe.
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const baseInputRef = useRef('')          // text already in the box when recording started

  // Live-preview path: the browser's own speech engine, used ONLY to show words
  // on screen as you speak (instant feedback). The accurate ElevenLabs transcript
  // replaces this preview the moment you stop.
  const liveRecRef = useRef(null)
  const livePreviewRef = useRef('')        // finalized preview text so far
  const liveStopRef = useRef(false)        // true = don't auto-restart the live engine

  const supportsVoice =
    typeof navigator !== 'undefined' &&
    !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) &&
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder !== 'undefined'

  const supportsLive =
    typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open, loading, transcribing])

  useEffect(() => () => {
    try { streamRef.current?.getTracks().forEach((t) => t.stop()) } catch (e) {}
    try { liveStopRef.current = true; liveRecRef.current?.abort() } catch (e) {}
  }, [])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
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

  const releaseStream = () => {
    try { streamRef.current?.getTracks().forEach((t) => t.stop()) } catch (e) {}
    streamRef.current = null
  }

  // ---- Live preview (browser engine): visual feedback only ----
  const startLivePreview = () => {
    if (!supportsLive) return
    liveStopRef.current = false
    livePreviewRef.current = ''
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const startOne = () => {
      let rec
      try { rec = new SR() } catch (e) { return }
      rec.lang = 'en-US'
      rec.interimResults = true
      rec.continuous = true
      rec.onresult = (e) => {
        let interim = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i]
          if (res.isFinal) livePreviewRef.current += res[0].transcript + ' '
          else interim += res[0].transcript
        }
        const base = baseInputRef.current
        setInput(((base ? base.trim() + ' ' : '') + (livePreviewRef.current + interim).trim()))
      }
      rec.onerror = () => {}
      rec.onend = () => { if (!liveStopRef.current) { try { rec.start() } catch (e) { try { startOne() } catch (_) {} } } }
      liveRecRef.current = rec
      try { rec.start() } catch (e) {}
    }
    startOne()
  }

  const stopLivePreview = () => {
    liveStopRef.current = true
    try { liveRecRef.current?.abort() } catch (e) {}
    liveRecRef.current = null
  }

  // ---- Accurate transcription (ElevenLabs Scribe) ----
  const transcribe = async (blob) => {
    if (!blob || !blob.size) { setTranscribing(false); return }
    setTranscribing(true)
    try {
      const audio = await blobToBase64(blob)
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ audio, mimeType: blob.type || 'audio/webm' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'transcribe failed')
      const t = (data.text || '').trim()
      const base = baseInputRef.current
      if (t) setInput((base ? base.trim() + ' ' : '') + t)          // replace preview with accurate text
      else if (!livePreviewRef.current.trim()) setMicError("I didn't catch any speech — tap the mic and try again.")
    } catch (e) {
      // Keep whatever the live preview captured; just note the accurate pass failed.
      if (!livePreviewRef.current.trim()) setMicError('Couldn’t transcribe that. Please try again, or type your question.')
    } finally {
      setTranscribing(false)
    }
  }

  const toggleMic = async () => {
    if (recording) {                       // stop
      stopLivePreview()
      try { recorderRef.current?.stop() } catch (e) {}
      return
    }
    if (!supportsVoice) { setMicError('Voice input isn’t supported in this browser. Try Chrome, Edge, or Safari.'); return }
    if (transcribing) return
    setMicError('')
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (e) {
      const name = e && e.name
      if (name === 'NotAllowedError' || name === 'SecurityError') setMicError('Microphone access is blocked. Allow mic access in your browser’s site settings, then try again.')
      else if (name === 'NotFoundError') setMicError('No microphone was found. Check that one is connected.')
      else setMicError('Couldn’t start the microphone. Please type your question.')
      return
    }
    streamRef.current = stream
    let recorder
    try { recorder = new MediaRecorder(stream) } catch (e) {
      releaseStream(); setMicError('Couldn’t start the microphone. Please type your question.'); return
    }
    chunksRef.current = []
    baseInputRef.current = input
    recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data) }
    recorder.onstop = async () => {
      setRecording(false)
      const type = recorder.mimeType || 'audio/webm'
      const blob = new Blob(chunksRef.current, { type })
      releaseStream()
      await transcribe(blob)
    }
    recorderRef.current = recorder
    try { recorder.start() } catch (e) {
      releaseStream(); setMicError('Couldn’t start the microphone. Please type your question.'); return
    }
    setRecording(true)
    startLivePreview()                     // show words live while recording
  }

  // Theme-aware class fragments
  const panel = dark ? 'border-[#26344c] bg-[#0f1a2e]' : 'border-slate-200 bg-white'
  const body = dark ? 'bg-[#0c1526]' : 'bg-slate-50'
  const botBubble = dark ? 'bg-[#18243c] text-slate-100 ring-1 ring-[#26344c]' : 'bg-white text-slate-700 ring-1 ring-slate-200'
  const loadBubble = dark ? 'bg-[#18243c] text-slate-400 ring-1 ring-[#26344c]' : 'bg-white text-slate-400 ring-1 ring-slate-200'
  const inputBar = dark ? 'border-[#26344c] bg-[#0f1a2e]' : 'border-slate-200 bg-white'
  const textareaCls = dark
    ? 'bg-[#0c1526] text-slate-100 border-[#26344c] placeholder:text-slate-500'
    : 'bg-white text-slate-800 border-slate-300 placeholder:text-slate-400'
  const micIdle = dark ? 'bg-[#18243c] text-slate-300 hover:bg-[#22304a]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
  const emailCls = dark ? 'text-slate-400 hover:text-blue-200' : 'text-slate-400 hover:text-[#213f66]'

  const placeholder = recording
    ? (supportsLive ? 'Listening… speak, then tap the mic to stop' : 'Recording… tap the mic to stop')
    : transcribing ? 'Polishing your words…' : 'Type or tap the mic to speak…'

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
        <div className={`fixed bottom-24 right-5 z-[60] flex h-[520px] w-[360px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border shadow-2xl ${panel}`}>
          <div className="flex items-center justify-between bg-[#213f66] px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">PropScope Support</p>
              <p className="text-xs text-blue-100/80">AI assistant · replies instantly</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-blue-100 hover:text-white"><X size={18} /></button>
          </div>

          <div className={`flex-1 space-y-3 overflow-y-auto p-3 ${body}`}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.role === 'user' ? 'bg-[#213f66] text-white' : botBubble}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className={`rounded-2xl px-3 py-2 ${loadBubble}`}><Loader2 size={16} className="animate-spin" /></div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className={`border-t p-2 ${inputBar}`}>
            {(recording || transcribing) && (
              <div className={`mb-1.5 flex items-center gap-2 px-1 text-xs ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
                {recording ? (
                  <><span className="inline-block h-2 w-2 animate-pulse rounded-full bg-rose-500" /> Listening…</>
                ) : (
                  <><Loader2 size={12} className="animate-spin" /> Polishing your words…</>
                )}
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => { setInput(e.target.value); if (micError) setMicError('') }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder={placeholder}
                className={`max-h-24 flex-1 resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#213f66] ${textareaCls}`}
              />
              {supportsVoice && (
                <button
                  onClick={toggleMic}
                  disabled={transcribing}
                  title={recording ? 'Stop and transcribe' : 'Speak your question'}
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition disabled:opacity-60 ${recording ? 'bg-rose-600 text-white animate-pulse' : micIdle}`}
                >
                  {transcribing ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
                </button>
              )}
              <button onClick={send} disabled={loading || !input.trim()} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:opacity-40">
                <Send size={16} />
              </button>
            </div>
            {micError && (
              <p className={`mt-1.5 px-1 text-xs ${dark ? 'text-rose-300' : 'text-rose-600'}`}>{micError}</p>
            )}
            <a href={`mailto:${SUPPORT_EMAIL}`} className={`mt-2 flex items-center justify-center gap-1.5 text-xs transition ${emailCls}`}>
              <Mail size={12} /> Prefer email? {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      )}
    </>
  )
}
