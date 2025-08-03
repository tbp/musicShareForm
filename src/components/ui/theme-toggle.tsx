'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  // Предотвращаем hydration mismatch - одинаковое состояние на сервере и клиенте
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // После монтирования синхронизируем с реальной темой
    setMounted(true)
    const currentTheme = document.documentElement.classList.contains('dark')
    setIsDark(currentTheme)

    // Отслеживаем изменения системной темы
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('theme')
      if (!savedTheme) {
        // Если пользователь не выбрал тему вручную, следуем системной
        setIsDark(e.matches)
        if (e.matches) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  // До монтирования показываем статичную иконку (предотвращение hydration mismatch)
  if (!mounted) {
    return (
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
        aria-label="Переключить тему"
      >
        <Moon className="h-4 w-4" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
      aria-label="Переключить тему"
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  )
} 