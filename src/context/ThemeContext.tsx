import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'franchise-os-theme'

function readThemeFromDoc(): Theme {
  if (typeof document === 'undefined') return 'dark'
  const t = document.documentElement.dataset.theme
  return t === 'light' ? 'light' : 'dark'
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* ignore */
  }
}

type ThemeContextValue = {
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readThemeFromDoc())

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      if (e.newValue === 'light' || e.newValue === 'dark') {
        document.documentElement.dataset.theme = e.newValue
        setThemeState(e.newValue)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: (t) => {
        applyTheme(t)
        setThemeState(t)
      },
      toggleTheme: () => {
        const next = theme === 'dark' ? 'light' : 'dark'
        applyTheme(next)
        setThemeState(next)
      },
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
