import { Link } from 'react-router-dom'
import Logo from '../../components/ui/Logo.jsx'

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink-50 px-6">
      <div className="text-center">
        <Logo />
        <p className="mt-8 text-6xl font-extrabold text-brand-600">404</p>
        <h1 className="mt-2 text-2xl font-bold text-ink-900">Page not found</h1>
        <p className="mt-2 text-ink-500">The page you're looking for doesn't exist or has moved.</p>
        <Link to="/" className="btn-primary mt-6">Back home</Link>
      </div>
    </div>
  )
}
