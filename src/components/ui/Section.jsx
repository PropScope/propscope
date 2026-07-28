export function Section({ id, className = '', children }) {
  return (
    <section id={id} className={`py-16 sm:py-24 ${className}`}>
      <div className="container-x">{children}</div>
    </section>
  )
}

export function SectionHeading({ eyebrow, title, subtitle, center = true }) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''} mb-12`}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink-900">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-ink-500">{subtitle}</p>}
    </div>
  )
}
