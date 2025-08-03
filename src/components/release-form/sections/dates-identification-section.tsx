import React, { useState } from 'react'
import { UPCManager } from '@/widgets/upc-manager'
import { ReleaseScheduleManager, ReleaseDateValidationInfo } from '@/widgets/release-schedule-manager'
import { Button as ShadcnButton } from '@/components/ui/button'
import { Popover as ShadcnPopover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { InfoIcon, Link, Link2Off } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReleaseFormData } from '@/types/ddex-release'

interface DatesIdentificationSectionProps {
  formData: ReleaseFormData
  errors: Record<string, string>
  onInputChange: (field: keyof ReleaseFormData, value: string | number | boolean) => void
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

export function DatesIdentificationSection({
  formData,
  errors,
  onInputChange
}: DatesIdentificationSectionProps) {
  // Состояние связи между датами
  const [isLinked, setIsLinked] = useState(() => {
    // Связь активна если даты одинаковые или оригинальная дата пустая
    return !formData.originalReleaseDate || formData.releaseDate === formData.originalReleaseDate
  })

  // Обработка изменения даты цифрового релиза
  const handleDigitalReleaseChange = (date: string) => {
    onInputChange('releaseDate', date)
    
    // Если связь активна - синхронизируем оригинальную дату
    if (isLinked) {
      onInputChange('originalReleaseDate', date)
    }
  }

  // Обработка изменения оригинальной даты
  const handleOriginalReleaseChange = (date: string) => {
    onInputChange('originalReleaseDate', date)
    
    // Если пользователь изменил оригинальную дату на другую - разрываем связь
    if (date !== formData.releaseDate) {
      setIsLinked(false)
    } else {
      // Если даты снова совпали - восстанавливаем связь
      setIsLinked(true)
    }
  }

  // Переключение состояния связи
  const toggleLink = () => {
    if (isLinked) {
      // Разрываем связь
      setIsLinked(false)
    } else {
      // Восстанавливаем связь - синхронизируем даты
      setIsLinked(true)
      onInputChange('originalReleaseDate', formData.releaseDate)
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-semibold text-foreground">
            Даты и идентификация
          </h2>
          <HelpTooltip>
            <div className="space-y-3">
              <p><strong>Дата цифрового релиза:</strong> Когда ваша музыка появится на стриминговых платформах.</p>
              <p><strong>Дата оригинального релиза:</strong> Когда трек был впервые выпущен (если это переиздание).</p>
              <p><strong>UPC:</strong> Уникальный код для идентификации релиза на платформах.</p>
            </div>
          </HelpTooltip>
        </div>
        <p className="text-sm text-muted-foreground">
          Настройте временные рамки и идентификаторы для вашего релиза
        </p>
      </div>

      <div className="space-y-6">
        {/* Связанные даты в 2 колонки с иконкой связи */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end">
          {/* Дата цифрового релиза */}
          <ReleaseScheduleManager
            value={formData.releaseDate}
            onChange={handleDigitalReleaseChange}
            label="Дата цифрового релиза"
            placeholder="Выберите дату релиза"
            error={errors.releaseDate}
            minDate={today}
            showPresets={true}
            required={true}
          />

          {/* Иконка связи с popover подсказкой */}
          <div className="flex items-center justify-center h-12">
            <ShadcnPopover>
              <PopoverTrigger asChild>
                <ShadcnButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleLink}
                  className={cn(
                    "h-6 w-6 p-0 rounded-full transition-all duration-200 hover:scale-110",
                    isLinked 
                      ? "text-primary hover:bg-primary/10" 
                      : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  {isLinked ? (
                    <Link className="h-4 w-4" />
                  ) : (
                    <Link2Off className="h-4 w-4" />
                  )}
                </ShadcnButton>
              </PopoverTrigger>
              
              <PopoverContent className="w-80 p-4" align="center">
                <div className="flex items-start gap-3">
                  {isLinked ? (
                    <Link className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  ) : (
                    <Link2Off className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  )}
                  <div className="space-y-2">
                    {isLinked ? (
                      <div>
                        <p className="font-medium text-foreground text-sm">Даты связаны</p>
                        <p className="text-muted-foreground text-xs">
                          Изменение даты цифрового релиза автоматически обновит оригинальную дату
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-foreground text-sm">Даты не связаны</p>
                        <p className="text-muted-foreground text-xs">
                          Оригинальная дата отличается от даты цифрового релиза (переиздание)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </ShadcnPopover>
          </div>

          {/* Дата оригинального релиза */}
          <ReleaseScheduleManager
            value={formData.originalReleaseDate}
            onChange={handleOriginalReleaseChange}
            label="Дата оригинального релиза"
            placeholder="Выберите оригинальную дату"
            error={errors.originalReleaseDate}
          />
        </div>

        {/* Информационный блок с валидацией дат - теперь часть Release Schedule Manager */}
        <ReleaseDateValidationInfo releaseDate={formData.releaseDate} />

        {/* UPC код с улучшенным интерфейсом */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-foreground">UPC код релиза</h3>
            <HelpTooltip>
              <div className="space-y-3">
                <p><strong>UPC (Universal Product Code)</strong> — уникальный идентификатор релиза для дистрибуции.</p>
                <p>Используется магазинами (iTunes, Spotify, Amazon) для каталогизации и продаж.</p>
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="font-medium">Поддерживаемые форматы:</p>
                  <ul className="text-xs space-y-1">
                    <li>• <strong>UPC-A:</strong> 12 цифр (американский стандарт)</li>
                    <li>• <strong>EAN-13:</strong> 13 цифр (европейский стандарт)</li>
                    <li>• <strong>UPC-E:</strong> 8 цифр (сокращенная версия)</li>
                  </ul>
                </div>
              </div>
            </HelpTooltip>
          </div>
          
          <UPCManager
            label=""
            value={formData.upc}
            onChange={(value) => onInputChange('upc', value)}
            placeholder="Укажите UPC код, если есть — иначе мы сгенерируем автоматически"
            error={errors.upc}
            showHelpButton={false}
          />

          {/* Информационная подсказка */}
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
            <p>
              <strong>Не указывайте UPC код, если его у вас нет.</strong> Мы автоматически сгенерируем уникальный код для вашего релиза.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}