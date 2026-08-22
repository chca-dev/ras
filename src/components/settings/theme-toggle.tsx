'use client'

import { useEffect, useState } from 'react'

const themeCookieName = 'ras-theme'
const themeCookieMaxAge = 60 * 60 * 24 * 365
const lightThemeColor = '#fbfbfb'
const darkThemeColor = '#323339'

const applyTheme = (isDark: boolean) => {
  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', isDark ? darkThemeColor : lightThemeColor)
}

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const nextIsDark = !isDark
    const secure = window.location.protocol === 'https:' ? '; Secure' : ''

    setIsDark(nextIsDark)
    applyTheme(nextIsDark)
    document.cookie = `${themeCookieName}=${nextIsDark ? 'dark' : 'light'}; Path=/; Max-Age=${themeCookieMaxAge}; SameSite=Lax${secure}`
  }

  return (
    <button
      type='button'
      role='switch'
      aria-checked={isDark}
      aria-label={isDark ? 'Désactiver le mode nuit' : 'Activer le mode nuit'}
      onClick={toggleTheme}
      className='group relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-border bg-muted p-0.5 transition-colors aria-checked:bg-primary'
    >
      <span
        aria-hidden='true'
        className='h-5 w-5 translate-x-0 rounded-full bg-card shadow-sm transition-transform group-aria-checked:translate-x-5'
      />
    </button>
  )
}
