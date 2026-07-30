import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext.jsx'

import MarketingLayout from './components/marketing/MarketingLayout.jsx'
import Home from './pages/marketing/Home.jsx'
import Features from './pages/marketing/Features.jsx'
import HowItWorks from './pages/marketing/HowItWorks.jsx'
import Pricing from './pages/marketing/Pricing.jsx'
import Faq from './pages/marketing/Faq.jsx'
import About from './pages/marketing/About.jsx'
import Contact from './pages/marketing/Contact.jsx'
import NotFound from './pages/marketing/NotFound.jsx'

import Login from './pages/auth/Login.jsx'
import Signup from './pages/auth/Signup.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'

import PortalLayout from './components/portal/PortalLayout.jsx'
import Dashboard from './pages/portal/Dashboard.jsx'
import NewDeal from './pages/portal/NewDeal.jsx'
import Reports from './pages/portal/Reports.jsx'
import ReportDetail from './pages/portal/ReportDetail.jsx'
import Account from './pages/portal/Account.jsx'
import Billing from './pages/portal/Billing.jsx'
import Admin from './pages/portal/Admin.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function RequireAuth({ children }) {
  const { isAuthed, loading } = useAuth()
  const location = useLocation()
  if (loading) return (
    <div className="grid min-h-screen place-items-center text-sm text-ink-400">Loading…</div>
  )
  if (!isAuthed) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Marketing */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Portal (protected) */}
        <Route
          path="/app"
          element={<RequireAuth><PortalLayout /></RequireAuth>}
        >
          <Route index element={<Dashboard />} />
          <Route path="new" element={<NewDeal />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/:id" element={<ReportDetail />} />
          <Route path="account" element={<Account />} />
          <Route path="billing" element={<Billing />} />
          <Route path="admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
