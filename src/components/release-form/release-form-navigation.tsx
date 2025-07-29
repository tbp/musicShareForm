import { Info, Music, Settings, Menu, AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface ReleaseFormNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  validationProgress: number
  onValidationClick: () => void
}

export function ReleaseFormNavigation({ 
  activeTab, 
  setActiveTab, 
  validationProgress, 
  onValidationClick 
}: ReleaseFormNavigationProps) {
  return (
    <div className="mb-8">
      <nav className="flex items-center justify-between py-4 border-b border-border">
        {/* Левая часть - Логотип и навигация */}
        <div className="flex items-center gap-8">
          {/* Мобильное меню */}
          <div className="md:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  aria-label="Открыть меню"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-48 p-2">
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('basic')}
                    className={`w-full flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'basic'
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <Info className="w-4 h-4" />
                    Основная информация
                  </button>
                  <button
                    onClick={() => setActiveTab('tracks')}
                    className={`w-full flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'tracks'
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <Music className="w-4 h-4" />
                    Треки
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'settings'
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    Настройки релиза
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Десктопная навигация */}
          <div className="hidden md:block">
            <nav aria-label="Main" className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('basic')}
                data-active={activeTab === 'basic'}
                className={`text-muted-foreground hover:text-primary border-b-primary hover:border-b-primary data-[active]:border-b-primary h-full justify-center rounded-none border-y-2 border-transparent py-2 px-4 font-medium hover:bg-transparent data-[active]:bg-transparent transition-all cursor-pointer ${
                  activeTab === 'basic' ? 'text-primary border-b-primary' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Основная информация
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('tracks')}
                data-active={activeTab === 'tracks'}
                className={`text-muted-foreground hover:text-primary border-b-primary hover:border-b-primary data-[active]:border-b-primary h-full justify-center rounded-none border-y-2 border-transparent py-2 px-4 font-medium hover:bg-transparent data-[active]:bg-transparent transition-all cursor-pointer ${
                  activeTab === 'tracks' ? 'text-primary border-b-primary' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Треки
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                data-active={activeTab === 'settings'}
                className={`text-muted-foreground hover:text-primary border-b-primary hover:border-b-primary data-[active]:border-b-primary h-full justify-center rounded-none border-y-2 border-transparent py-2 px-4 font-medium hover:bg-transparent data-[active]:bg-transparent transition-all cursor-pointer ${
                  activeTab === 'settings' ? 'text-primary border-b-primary' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Настройки релиза
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Правая часть - Диагностика */}
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
                : 'Заполните форму'
              }
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-mono px-1.5 py-0.5 bg-muted rounded">
            {validationProgress}%
          </span>
        </button>
      </nav>
    </div>
  )
} 