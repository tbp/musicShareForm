'use client'

import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const media = window.matchMedia(query)
    
    // Устанавливаем начальное значение
    setMatches(media.matches)
    
    // Создаем обработчик изменений
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }
    
    // Добавляем слушатель
    if (media.addEventListener) {
      media.addEventListener('change', listener)
    } else {
      // Fallback для старых браузеров
      media.addListener(listener)
    }
    
    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener)
      } else {
        // Fallback для старых браузеров  
        media.removeListener(listener)
      }
    }
  }, [query, isClient])

  return matches
}