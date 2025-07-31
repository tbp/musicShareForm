'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Plus, X, Info, HelpCircle } from 'lucide-react'
import { ArtistCredit } from '@/types/ddex-release'
import { createColumns, ParticipantRow } from '@/components/release-form/participants-table'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CreateParticipantModal } from '@/components/ui/create-participant-modal'
import { cn } from '@/lib/utils'

// Обертка для таблицы участников без SSR
interface ParticipantsTableWrapperProps {
  data: ParticipantRow[]
  columns: any[]
  onMoveRow: (activeIndex: number, overIndex: number) => void
}

const ParticipantsTableWrapper = dynamic(
  () => import('./participants-table-wrapper'),
  { 
    ssr: false,
    loading: () => (
      <div className="rounded-md border">
        <div className="p-4 text-center text-muted-foreground">
          Загрузка таблицы участников...
        </div>
      </div>
    )
  }
)

// Минималистичный компонент превью участников  
interface ParticipantsPreviewProps {
  participants: ArtistCredit[]
  formData: { variousArtists?: boolean }
  onInputChange: (field: string, value: any) => void
}

const ParticipantsPreview = React.memo(function ParticipantsPreview({ 
  participants, 
  formData,
  onInputChange
}: ParticipantsPreviewProps) {
  // Показываем только участников с достаточно заполненными именами (минимум 3 символа)
  // Это предотвращает показ превью во время активного ввода
  const completedMainArtists = participants.filter(p => 
    p.role === 'MainArtist' && 
    p.displayName.trim().length >= 3
  )
  
  const completedFeaturedArtists = participants.filter(p => 
    p.role === 'FeaturedArtist' && 
    p.displayName.trim().length >= 3
  )
  
  // Если нет завершенных участников - не показываем превью
  if (completedMainArtists.length === 0) return null

  const formatArtistDisplay = () => {
    // Если включен режим "Несколько артистов" - показываем "Various Artists"
    if (formData.variousArtists) {
      return 'Various Artists'
    }
    
    let artistString = ''
    
    // Основные артисты через запятую как на площадках
    if (completedMainArtists.length === 1) {
      artistString = completedMainArtists[0].displayName
    } else if (completedMainArtists.length === 2) {
      artistString = `${completedMainArtists[0].displayName}, ${completedMainArtists[1].displayName}`
    } else if (completedMainArtists.length > 2) {
      const firstTwo = completedMainArtists.slice(0, 2).map(a => a.displayName).join(', ')
      artistString = `${firstTwo}, and ${completedMainArtists.length - 2} more`
    }
    
    // Featured артисты
    if (completedFeaturedArtists.length > 0) {
      const featuredString = completedFeaturedArtists.length === 1 
        ? completedFeaturedArtists[0].displayName
        : `${completedFeaturedArtists[0].displayName}${completedFeaturedArtists.length > 1 ? ` & ${completedFeaturedArtists.length - 1} other${completedFeaturedArtists.length > 2 ? 's' : ''}` : ''}`
      
      artistString += ` (feat. ${featuredString})`
    }
    
    return artistString
  }

  // Показываем переключатель только если есть завершенные участники
  const shouldShowVariousArtistsToggle = completedMainArtists.length > 1

  // Убираем автоматическое включение Various Artists
  // Пользователь может включить сам при необходимости

  return (
    <div className="mt-6 space-y-3">
      {/* Нейтральный блок-превью */}
      <div className="bg-muted/30 border border-border/50 rounded-md px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Отображение на площадках
          </span>
        </div>
        
        <div className="text-sm text-foreground font-medium">
          {formatArtistDisplay()}
        </div>
      </div>
        
      {/* Полезная подсказка для завершенных участников */}
      <div className="text-xs text-muted-foreground/60 leading-relaxed">
        {completedFeaturedArtists.length > 0 
          ? `Приглашённые артисты (${completedFeaturedArtists.length}): ${completedFeaturedArtists.map(a => a.displayName).join(', ')}`
          : completedMainArtists.length > 1 
            ? "Несколько основных артистов — рассмотрите включение режима 'Various Artists'"
            : "Добавьте участников через автокомплит для отображения превью"
        }
      </div>
        
      {shouldShowVariousArtistsToggle && (
        <div className="flex items-center gap-3 pt-3 border-t border-border/20">
          <Switch
            id="variousArtists"
            checked={formData.variousArtists || false}
            onCheckedChange={(checked) => onInputChange('variousArtists', checked)}
          />
          <label 
            htmlFor="variousArtists" 
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Various Artists
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 text-xs" side="top" align="start">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Various Artists</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Используется для сборников с множеством разных исполнителей. 
                  Автоматически активируется при добавлении 4+ основных артистов.
                </p>
                <ul className="text-muted-foreground/80 space-y-0.5 ml-3 text-xs">
                  <li>• Помогает площадкам правильно категоризировать релиз</li>
                  <li>• Все участники сохраняются в метаданных</li>
                </ul>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
})

// Компонент футера с суммами
interface ParticipantsTotalFooterProps {
  participants: ArtistCredit[]
}

const ParticipantsTotalFooter = React.memo(function ParticipantsTotalFooter({ participants }: ParticipantsTotalFooterProps) {
  const totalCopyright = participants.reduce((sum, p) => sum + (p.copyrightShare || 0), 0)
  const totalRelatedRights = participants.reduce((sum, p) => sum + (p.relatedRightsShare || 0), 0)

  const getCopyrightStatus = (total: number) => {
    if (total === 100) return { color: 'text-green-600', text: 'Корректно', icon: '✓' }
    if (total > 100) return { color: 'text-red-600', text: 'Превышено', icon: '!' }
    if (total > 0) return { color: 'text-amber-600', text: 'Неполное', icon: '△' }
    return { color: 'text-muted-foreground', text: 'Не указано', icon: '○' }
  }

  const copyrightStatus = getCopyrightStatus(totalCopyright)
  const relatedRightsStatus = getCopyrightStatus(totalRelatedRights)

  return (
    <div className="mt-4 p-4 bg-muted/20 rounded-lg border border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Распределение прав</span>
        </div>
        
        <div className="flex items-center gap-8">
          {/* Авторские права */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground/80">Авторские:</span>
            <div className={cn(
              "text-sm font-medium px-2 py-1 rounded-md text-center min-w-[60px]",
              copyrightStatus.color.includes('green') ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" :
              copyrightStatus.color.includes('red') ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400" :
              copyrightStatus.color.includes('amber') ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" :
              "bg-muted text-muted-foreground"
            )}>
              {totalCopyright}%
            </div>
          </div>
          
          {/* Смежные права */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground/80">Смежные:</span>
            <div className={cn(
              "text-sm font-medium px-2 py-1 rounded-md text-center min-w-[60px]",
              relatedRightsStatus.color.includes('green') ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" :
              relatedRightsStatus.color.includes('red') ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400" :
              relatedRightsStatus.color.includes('amber') ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" :
              "bg-muted text-muted-foreground"
            )}>
              {totalRelatedRights}%
            </div>
          </div>
        </div>
      </div>
      
      {(totalCopyright !== 100 || totalRelatedRights !== 100) && (
        <div className="mt-3 text-xs text-muted-foreground/70 leading-relaxed">
          {(totalCopyright > 100 || totalRelatedRights > 100) 
            ? 'Сумма долей превышает 100%. Проверьте распределение прав между участниками.'
            : 'Сумма долей может быть неполной — это нормально, если не планируете точное распределение доходов.'
          }
        </div>
      )}
    </div>
  )
})

// Интерфейс для секции участников
interface ParticipantsSectionProps {
  formData: {
    artists: ArtistCredit[]
    title?: string
    releaseType?: string
    variousArtists?: boolean
  }
  onInputChange: (field: string, value: any) => void
  onUpdateArtist: (index: number, field: string, value: any) => void
  onAddArtist: () => void
  onRemoveArtist: (index: number) => void
  onMoveArtist: (fromIndex: number, toIndex: number) => void
  errors: { [key: string]: string }
}

export function ParticipantsSection({
  formData,
  onInputChange,
  onUpdateArtist,
  onAddArtist,
  onRemoveArtist,
  onMoveArtist,
  errors
}: ParticipantsSectionProps) {
  // Состояние для редактирования участника
  const [editingParticipant, setEditingParticipant] = React.useState<{index: number, participant: ArtistCredit} | null>(null)

  // Обработчик редактирования участника
  const handleEditParticipant = React.useCallback((index: number, participant: ArtistCredit) => {
    setEditingParticipant({ index, participant })
  }, [])

  // Обработчик сохранения изменений участника
  const handleSaveParticipant = React.useCallback((updatedParticipant: any) => {
    if (editingParticipant) {
      // Обновляем участника по индексу
      Object.keys(updatedParticipant).forEach(key => {
        onUpdateArtist(editingParticipant.index, key, updatedParticipant[key])
      })
      setEditingParticipant(null)
    }
  }, [editingParticipant, onUpdateArtist])

  // Преобразуем artists в ParticipantRow, используя стабильные ID из данных
  const participantsData: ParticipantRow[] = React.useMemo(() => 
    formData.artists.map((artist, index) => ({
      ...artist,
      id: artist.id || `legacy-participant-${index}` // Fallback для старых данных
    })), [formData.artists])

  // Создаем колонки с передачей колбеков (мемоизируем для предотвращения перерендеров)
  const columns = React.useMemo(() => createColumns({
    onUpdate: onUpdateArtist,
    onRemove: onRemoveArtist,
    onEdit: handleEditParticipant
  }), [onUpdateArtist, onRemoveArtist, handleEditParticipant])

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка добавления */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">Участники</h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Укажите всех участников релиза и их роли. Доли в правах можно не заполнять, если не планируете точное распределение доходов.
          </p>
        </div>
        
        <Button 
          onClick={onAddArtist} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2 flex-shrink-0 ml-6 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all duration-200 group"
        >
          <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          Добавить участника
        </Button>
      </div>

      {/* Таблица участников */}
      <div className="space-y-4">
        {formData.artists.length > 0 ? (
          <div>
            <ParticipantsTableWrapper
              columns={columns}
              data={participantsData}
              onMoveRow={onMoveArtist}
            />
            
            {/* Футер с суммами */}
            <ParticipantsTotalFooter participants={formData.artists} />
            
            {/* Минималистичное превью участников */}
            <ParticipantsPreview 
              participants={formData.artists} 
              formData={formData}
              onInputChange={onInputChange}
            />
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-muted-foreground">
                <p className="text-sm">Участники не добавлены</p>
                <p className="text-xs mt-1">Нажмите кнопку справа для добавления участника</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Ошибки валидации */}
      {errors.artists && (
        <div className="text-destructive text-sm flex items-center gap-2">
          <X className="h-4 w-4" />
          {errors.artists}
        </div>
      )}

      {/* Модальное окно редактирования участника */}
      <CreateParticipantModal
        isOpen={!!editingParticipant}
        onClose={() => setEditingParticipant(null)}
        onCreateParticipant={handleSaveParticipant}
        initialDisplayName={editingParticipant?.participant.displayName || ''}
        initialData={editingParticipant?.participant}
        mode="edit"
      />
    </div>
  )
}