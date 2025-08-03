'use client'

import { Info, Music, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useReleaseFormContext } from '@/contexts/release-form-context'
import { ShareButton } from '@/components/share/share-button'

// Навигационные ссылки для страниц
const navigationLinks = [
  { 
    key: 'basic', 
    href: '/',
    label: 'Основная информация', 
    icon: <Info className="w-4 h-4" /> 
  },
  { 
    key: 'tracks', 
    href: '/tracks',
    label: 'Треки', 
    icon: <Music className="w-4 h-4" /> 
  },
  { 
    key: 'settings', 
    href: '/settings',
    label: 'Настройки релиза', 
    icon: <Settings className="w-4 h-4" /> 
  },
]

export default function ReleaseNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { 
    validationProgress, 
    setValidationOpen 
  } = useReleaseFormContext()

  const onValidationClick = () => setValidationOpen(true)

  // Определяем активную страницу по pathname
  const getActiveKey = (pathname: string) => {
    if (pathname === '/') return 'basic'
    if (pathname === '/tracks') return 'tracks'
    if (pathname === '/settings') return 'settings'
    return 'basic'
  }

  const activeTab = getActiveKey(pathname)

  return (
    <>
      {/* Заголовок страницы - НЕ sticky */}
      <div className="bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="py-6">
              <h1 className="text-3xl font-bold text-foreground">
                Редактирование релиза
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Только меню с табами - sticky */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <nav className="flex items-center justify-between py-4">
              {/* Левая часть - табы */}
              <div className="flex items-center">
                {/* Десктопные табы - нативная Origin UI реализация */}
                <div className="hidden md:flex items-center">
                  {navigationLinks.map((link) => (
                    <Link
                      key={link.key}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-2 px-4 py-1.5 text-sm font-medium transition-all cursor-pointer border-b-2",
                        activeTab === link.key
                          ? "text-primary border-b-primary"
                          : "text-muted-foreground border-transparent hover:text-primary hover:border-b-primary"
                      )}
                      data-active={activeTab === link.key}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Мобильные табы - селект */}
                <div className="md:hidden">
                  <select 
                    value={activeTab} 
                    onChange={(e) => {
                      const selectedLink = navigationLinks.find(link => link.key === e.target.value)
                      if (selectedLink) {
                        router.push(selectedLink.href)
                      }
                    }}
                    className="bg-background border border-border rounded-md px-3 py-2 text-sm"
                  >
                    {navigationLinks.map((link) => (
                      <option key={link.key} value={link.key}>
                        {link.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Правая часть - экшены */}
              <div className="flex items-center gap-2 md:gap-3">
                {/* Валидация прогресса - минималистичная кнопка */}
                <button
                  onClick={onValidationClick}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                >
                  <span className="text-xs md:text-sm">
                    {validationProgress === 100 ? (
                      <span>
                        <span className="hidden sm:inline">Готов к публикации</span>
                        <span className="sm:hidden">Готов</span>
                      </span>
                    ) : (
                      <span>
                        <span className="hidden sm:inline">Прогресс </span>
                        {validationProgress}%
                      </span>
                    )}
                  </span>
                </button>

                {/* Кнопка поделиться */}
                <ShareButton />
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}