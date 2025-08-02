'use client'

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Save, Info, Music, Settings, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useReleaseFormContext } from '@/contexts/release-form-context'
import { cn } from '@/lib/utils'

// Навигационные ссылки для табов
const navigationLinks = [
  { 
    key: 'basic', 
    label: 'Основная информация', 
    icon: <Info className="w-4 h-4" /> 
  },
  { 
    key: 'tracks', 
    label: 'Треки', 
    icon: <Music className="w-4 h-4" /> 
  },
  { 
    key: 'settings', 
    label: 'Настройки релиза', 
    icon: <Settings className="w-4 h-4" /> 
  },
]

export default function EnhancedReleaseFormNavigation() {
  const { 
    activeTab, 
    setActiveTab, 
    validationProgress, 
    hasFormChanges,
    handleSubmit, 
    isSubmitting,
    setValidationOpen 
  } = useReleaseFormContext()

  const onValidationClick = () => setValidationOpen(true)

  return (
    <>
      {/* Заголовок страницы - НЕ sticky */}
      <div className="bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="py-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Создание релиза
              </h1>
              <p className="text-muted-foreground">
                Заполните информацию о вашем музыкальном релизе
              </p>
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
                    <button
                      key={link.key}
                      onClick={() => setActiveTab(link.key)}
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
                    </button>
                  ))}
                </div>
              </div>

              {/* Правая часть - диагностика и кнопка сохранения */}
              <div className="flex items-center gap-4">
                {/* Диагностика */}
                <button
                  onClick={onValidationClick}
                  className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    {validationProgress === 100 ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className={`w-4 h-4 ${
                        validationProgress >= 70 ? 'text-amber-500' : 'text-muted-foreground'
                      }`} />
                    )}
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {validationProgress === 100 
                        ? 'Готово к публикации' 
                        : validationProgress >= 70 
                        ? 'Почти готово' 
                        : 'Заполните релиз'
                      }
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono px-1.5 py-0.5 bg-muted rounded">
                    {validationProgress}%
                  </span>
                </button>

                {/* Кнопка сохранения */}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !hasFormChanges}
                  variant={hasFormChanges ? "outline" : "ghost"}
                  className={cn(
                    "flex items-center gap-2 transition-all",
                    hasFormChanges && "hover:bg-primary hover:text-primary-foreground"
                  )}
                  size="sm"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}