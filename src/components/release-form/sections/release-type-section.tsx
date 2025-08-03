'use client'

import React from 'react'
import { Play, Disc, Library, FolderOpen, InfoIcon } from 'lucide-react'
import { RadioCard, RadioCardGroup } from '@/components/ui/radio-card'
import { Popover as ShadcnPopover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button as ShadcnButton } from '@/components/ui/button'
import { ReleaseFormData } from '@/types/ddex-release'


interface ReleaseTypeSectionProps {
  formData: ReleaseFormData
  errors: Record<string, string>
  onInputChange: (field: string, value: any) => void
}

// Компонент помощи с информацией
function HelpTooltip({ children }: { children: React.ReactNode }) {
  return (
    <ShadcnPopover>
      <PopoverTrigger asChild>
        <ShadcnButton variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground">
          <InfoIcon className="h-4 w-4" />
        </ShadcnButton>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm">
        {children}
      </PopoverContent>
    </ShadcnPopover>
  )
}

export function ReleaseTypeSection({
  formData,
  errors,
  onInputChange
}: ReleaseTypeSectionProps) {
  const handleReleaseTypeChange = (value: string) => {
    onInputChange('releaseType', value)
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-semibold text-foreground">
            Тип релиза
          </h2>
          <HelpTooltip>
            <div className="space-y-3">
              <p><strong>Сингл:</strong> 1-3 трека. Основной формат для отдельных песен.</p>
              <p><strong>EP:</strong> 4-7 треков. Мини-альбом или расширенный сингл.</p>
              <p><strong>Альбом:</strong> 8+ треков. Полноформатный релиз.</p>
              <p><strong>Сборник:</strong> Коллекция ранее изданных треков или компиляция разных артистов.</p>
            </div>
          </HelpTooltip>
        </div>
        <p className="text-sm text-muted-foreground">
          Выберите формат вашего релиза для правильной категоризации
        </p>
      </div>
      
      <div className="space-y-6">
        <RadioCardGroup
          value={formData.releaseType}
          onValueChange={handleReleaseTypeChange}
        >
          <RadioCard
            value="Single"
            title="Сингл"
            description="1-3 трека"
            icon={<Play className="w-4 h-4" />}
          />
          <RadioCard
            value="EP"
            title="EP"
            description="4-7 треков"
            icon={<Library className="w-4 h-4" />}
          />
          <RadioCard
            value="Album"
            title="Альбом"
            description="8+ треков"
            icon={<Disc className="w-4 h-4" />}
          />
          <RadioCard
            value="Compilation"
            title="Сборник"
            description="Ранее изданное"
            icon={<FolderOpen className="w-4 h-4" />}
          />
        </RadioCardGroup>
      </div>

      {/* Ошибки валидации */}
      {errors.releaseType && (
        <div className="mt-4 text-sm text-destructive">
          {errors.releaseType}
        </div>
      )}
    </div>
  )
}