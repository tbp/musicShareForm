'use client'

import React from 'react'
import { ExternalLink, Edit3, User, IdCard, Hash } from 'lucide-react'
import { ParticipantSuggestion } from '@/data/participants'
import { getPlatformInfo } from '@/lib/platforms'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { usePlatformIcon } from '@/components/shared/icons'

interface ArtistPlatformsPopoverProps {
  participant: ParticipantSuggestion
  children: React.ReactNode
  onEdit?: () => void
}

export function ArtistPlatformsPopover({
  participant,
  children,
  onEdit
}: ArtistPlatformsPopoverProps) {
  const { platformLinks = [], realName, isni, ipi } = participant
  
  // Показываем popover если есть платформы, дополнительная информация или возможность редактирования
  const hasContent = platformLinks.length > 0 || realName || isni || ipi || onEdit
  
  if (!hasContent) return <>{children}</>

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <div className="space-y-0">
          {/* Заголовок с именем и кнопкой редактирования */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-foreground truncate">
                {participant.displayName}
              </h3>
              {realName && (
                <p className="text-xs text-muted-foreground truncate">
                  {realName}
                </p>
              )}
            </div>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-7 w-7 p-0 ml-2 flex-shrink-0 hover:bg-accent"
                title="Редактировать участника"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Профессиональные идентификаторы */}
          {(isni || ipi) && (
            <div className="p-3 border-b border-border space-y-2">
              {isni && (
                <div className="flex items-center gap-2 text-xs">
                  <IdCard className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">ISNI:</span>
                  <span className="font-mono">{isni}</span>
                </div>
              )}
              {ipi && (
                <div className="flex items-center gap-2 text-xs">
                  <Hash className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">IPI:</span>
                  <span className="font-mono">{ipi}</span>
                </div>
              )}
            </div>
          )}

          {/* Платформы */}
          {platformLinks.length > 0 ? (
            <div className="p-2">
              <div className="space-y-1">
                {platformLinks.map((link, index) => {
                  const platformInfo = getPlatformInfo(link.platform)
                  const PlatformIcon = usePlatformIcon(link.platform)
                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors text-sm group"
                    >
                      <PlatformIcon
                        size="md"
                        className="flex-shrink-0"
                        title={platformInfo.name}
                        aria-label={platformInfo.name}
                      />
                      <span className="flex-1 truncate">{platformInfo.name}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </a>
                  )
                })}
              </div>
            </div>
          ) : onEdit && (
            /* Если нет платформ но есть редактирование - показываем полезное сообщение */
            <div className="p-3 text-center">
              <p className="text-xs text-muted-foreground">
                Нет ссылок на площадки
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Нажмите кнопку редактирования чтобы добавить
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}