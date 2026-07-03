import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

export type ThemeName = 'candlelight' | 'arcane-slate'
const STORAGE_KEY = 'dicefight.theme'

const ThemeContext = createContext<{
  theme: ThemeName
  setTheme: (t: ThemeName) => void
}>({
  theme: 'candlelight',
  setTheme: () => {},
})

function initialTheme(): ThemeName {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'arcane-slate' ? 'arcane-slate' : 'candlelight'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(initialTheme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
