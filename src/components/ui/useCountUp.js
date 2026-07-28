import { useEffect, useRef, useState } from 'react'

// Counts from 0 to `end` once the element is on screen.
export function useCountUp(end, { duration = 1600, decimals = 0 } = {}) {
  const ref = useRef(null)
  const [val, setVal] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const t0 = performance.now()
        const tick = (t) => {
          const p = Math.min(1, (t - t0) / duration)
          const eased = 1 - Math.pow(1 - p, 3)
          setVal(end * eased)
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [end, duration])
  return [ref, Number(val).toFixed(decimals)]
}
