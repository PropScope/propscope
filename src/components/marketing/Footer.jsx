import { Link } from 'react-router-dom'
import Logo from '../ui/Logo.jsx'

export default function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-ink-50">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-ink-500">
              Investor-grade real estate deal analysis, automated. Turn any address into a decision in minutes.
            </p>
          </div>
          <FooterCol title="Product" links={[
            ['Features', '/features'], ['How it works', '/how-it-works'],
            ['Pricing', '/pricing'], ['FAQ', '/faq'],
          ]} />
          <FooterCol title="Company" links={[
            ['About', '/about'], ['Contact', '/contact'], ['Log in', '/login'], ['Get started', '/signup'],
          ]} />
          <FooterCol title="Legal" links={[
            ['Privacy', '/faq'], ['Terms', '/faq'], ['Disclaimer', '/faq'],
          ]} />
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-ink-200 pt-6 text-sm text-ink-400 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} PropScope. All rights reserved.</p>
          <p>Reports are estimates for informational purposes only — not financial advice.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-ink-900">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="text-sm text-ink-500 hover:text-brand-600">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
