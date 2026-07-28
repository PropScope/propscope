import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { getTheme, toggleTheme } from '../../lib/theme.js'

export default function ThemeToggle({ className = '' }) {
  const [theme, setThemeState] = useState(getTheme())
  const onClick = () => setThemeState(toggleTheme())
  return (
    <button onClick={onClick} title="Toggle dark mode" aria-label="Toggle dark mode"
      className={`grid h-9 w-9 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 ${className}`}>
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
