'use client'

import React from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CheckCircle2Icon, AlertTriangleIcon, ClockIcon, CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getReleaseDateInfo } from '../utils/dateUtils'

interface ReleaseDateValidationInfoProps {
  releaseDate: string
}

export function ReleaseDateValidationInfo({ 
  releaseDate 
}: ReleaseDateValidationInfoProps) {
  if (!releaseDate) return null

  const releaseDateInfo = getReleaseDateInfo(releaseDate)
  
  if (!releaseDateInfo || !releaseDateInfo.isInFuture) return null

  const { daysUntilRelease } = releaseDateInfo
  
  // Определяем уровни по дням до релиза
  const isCritical = daysUntilRelease < 7      // Красный: критично
  const isWarning = daysUntilRelease < 14      // Желтый: предупреждение  
  const isNotice = daysUntilRelease < 28       // Синий: внимание
  // Остальное: зеленый - оптимально

  return (
    <div className={cn(
      "border rounded-lg p-4",
      isCritical 
        ? "bg-destructive/5 border-destructive/20" 
        : isWarning 
        ? "bg-warning/5 border-warning/20"
        : isNotice
        ? "bg-info/5 border-info/20"
        : "bg-success/5 border-success/20"
    )}>
      <div className="flex items-start gap-3">
        {isCritical ? (
          <AlertTriangleIcon className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
        ) : isWarning ? (
          <ClockIcon className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
        ) : isNotice ? (
          <CalendarIcon className="h-5 w-5 text-info mt-0.5 flex-shrink-0" />
        ) : (
          <CheckCircle2Icon className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
        )}
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {isCritical 
              ? `Критично! До релиза всего ${daysUntilRelease} ${daysUntilRelease === 1 ? 'день' : daysUntilRelease < 5 ? 'дня' : 'дней'}`
              : isWarning 
              ? `Внимание! До релиза осталось ${daysUntilRelease} ${daysUntilRelease === 1 ? 'день' : daysUntilRelease < 5 ? 'дня' : 'дней'}`
              : isNotice
              ? `До релиза ${daysUntilRelease} ${daysUntilRelease === 1 ? 'день' : daysUntilRelease < 5 ? 'дня' : 'дней'}`
              : `Релиз запланирован на ${format(new Date(releaseDate), "dd MMMM yyyy", { locale: ru })}`
            }
          </p>
          
          <div className="text-xs text-muted-foreground space-y-1">
            {isCritical ? (
              <>
                <p>• Питчинг в плейлисты недоступен</p>
                <p>• Рекомендуем перенести релиз минимум на 2 недели</p>
              </>
            ) : isWarning ? (
              <>
                <p>• Ограниченный доступ к питчингу в плейлисты</p>
                <p>• Загрузите материалы как можно скорее</p>
              </>
            ) : isNotice ? (
              <>
                <p>• Загрузите материалы минимум за 2 недели до релиза</p>
                <p>• Питчинг в плейлисты Spotify открывается за 4 недели</p>
              </>
            ) : (
              <>
                <p>• Оптимальное время для подготовки промо-кампании</p>
                <p>• Полный доступ к питчингу в плейлисты всех платформ</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}