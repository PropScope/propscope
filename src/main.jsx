import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

// Register the service worker so PropScope is installable as an app on phones/desktops.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

// Capture the browser's install prompt so the in-app "Install app" button can trigger it on demand.
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.__psInstallPrompt = e
  window.dispatchEvent(new Event('ps-installable'))
})
