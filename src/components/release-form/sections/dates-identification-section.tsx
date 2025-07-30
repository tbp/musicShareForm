import React, { useState } from 'react'
import { UPCInput } from '@/components/ui/upc-input'
import { Button as ShadcnButton } from '@/components/ui/button'
import { 
  DatePicker, 
  Label, 
  Group, 
  DateInput, 
  DateSegment, 
  Button, 
  Popover, 
  Dialog,
  Calendar,
  CalendarGrid,
  CalendarCell,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarGridBody,
  Heading,
  Text,
  FieldError
} from 'react-aria-components'
import { Popover as ShadcnPopover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon, InfoIcon, AlertCircleIcon, CheckCircle2Icon, AlertTriangleIcon, Link, Link2Off, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReleaseFormData } from '@/types/ddex-release'
import { CalendarDate, today, getLocalTimeZone, parseDate, DateValue } from '@internationalized/date'
import { I18nProvider } from 'react-aria-components'

interface DatesIdentificationSectionProps {
  formData: ReleaseFormData
  errors: Record<string, string>
  onInputChange: (field: keyof ReleaseFormData, value: string | number | boolean) => void
}

// Предустановки дат для удобства пользователя (сортировка: от дальних к ближним)
const DATE_PRESETS = [
  { label: 'Через месяц', getValue: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  { label: 'Через 2 недели', getValue: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
  { label: 'Через неделю', getValue: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  { label: 'Завтра', getValue: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
]

// Origin UI DatePicker компонент с нашими кастомными фичами
function EnhancedDatePicker({
  value,
  onChange,
  label,
  placeholder,
  error,
  minDate,
  showPresets = false,
  disabled = false,
  required = false,
  additionalContent
}: {
  value?: string
  onChange: (date: string) => void
  label: string
  placeholder?: string
  error?: string
  minDate?: Date
  showPresets?: boolean
  disabled?: boolean
  required?: boolean
  additionalContent?: React.ReactNode
}) {
  // Состояние для контроля popover
  const [isOpen, setIsOpen] = useState(false)
  
  // Конвертация строковой даты в CalendarDate для React Aria
  const calendarValue = value ? parseDate(value) : null
  
  // Конвертация minDate в CalendarDate если задана
  const minValue = minDate ? new CalendarDate(
    minDate.getFullYear(), 
    minDate.getMonth() + 1, 
    minDate.getDate()
  ) : null

  // Обработка изменения даты из React Aria
  const handleDateChange = (date: DateValue | null) => {
    if (date) {
      const dateString = date.toString() // Конвертация CalendarDate в строку YYYY-MM-DD
      onChange(dateString)
      // Закрываем popover после выбора даты в календаре
      setIsOpen(false)
    } else {
      onChange('')
    }
  }

  // Принудительно обновляем компонент при изменении value для корректной работы валидации
  React.useEffect(() => {
    // Этот useEffect помогает синхронизировать состояние при клавиатурном вводе
  }, [value])

  // Обработка клика на preset - тоже закрываем popover
  const handlePresetClick = (calendarDate: CalendarDate) => {
    handleDateChange(calendarDate)
    setIsOpen(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {additionalContent}
      </div>
      
      {/* Origin UI DatePicker с русской локализацией */}
      <I18nProvider locale="ru-RU">
        <DatePicker 
          value={calendarValue}
          onChange={handleDateChange}
          minValue={minValue}
          isDisabled={disabled}
          isRequired={required}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          className="group flex flex-col gap-1"
        >
        <Label className="text-sm font-medium text-foreground flex items-center gap-2">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        
        <Group className={cn(
          "flex items-center gap-0 w-full bg-background border border-input rounded-lg",
          "focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-primary",
          "transition-all duration-200 ease-out",
          error && "border-destructive focus-within:ring-destructive focus-within:border-destructive",
          disabled && "opacity-50 cursor-not-allowed"
        )}>
          <DateInput className="flex-1 px-4 py-3 bg-transparent outline-none">
            {segment => (
              <DateSegment 
                segment={segment} 
                className={cn(
                  "px-1 tabular-nums outline-none rounded text-base",
                  "focus:bg-primary focus:text-primary-foreground caret-transparent",
                  "placeholder-shown:text-muted-foreground",
                  segment.type === 'literal' && "px-0.5 text-muted-foreground"
                )}
              />
            )}
          </DateInput>
          
          <Button className={cn(
            "px-3 h-12 bg-transparent hover:bg-accent rounded-r-lg border-0",
            "flex items-center justify-center text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring/20"
          )}>
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </Group>

        {/* Popover с календарем и presets */}
        <Popover className="w-fit max-w-none">
          <Dialog className="p-0 bg-background border border-border rounded-lg shadow-lg outline-none">
            <div className="flex">
              {/* Календарь с русской локализацией */}
              <Calendar className="p-4" firstDayOfWeek="mon">
                <header className="flex items-center justify-between pb-4">
                  <Button 
                    slot="previous"
                    className="p-2 hover:bg-accent rounded transition-colors"
                    aria-label="Предыдущий месяц"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <Heading className="font-semibold text-lg text-center min-w-[8rem]" />
                  <Button 
                    slot="next"
                    className="p-2 hover:bg-accent rounded transition-colors"
                    aria-label="Следующий месяц"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </header>
                
                <CalendarGrid className="border-spacing-1 border-separate">
                  <CalendarGridHeader>
                    {day => (
                      <CalendarHeaderCell className="text-xs text-muted-foreground font-semibold p-2 w-9 h-7 text-center">
                        {day}
                      </CalendarHeaderCell>
                    )}
                  </CalendarGridHeader>
                  <CalendarGridBody>
                    {date => (
                      <CalendarCell 
                        date={date} 
                        className={cn(
                          "w-9 h-9 text-sm rounded cursor-pointer",
                          "flex items-center justify-center",
                          "hover:bg-accent transition-colors",
                          "selected:bg-primary selected:text-primary-foreground selected:font-medium",
                          "outside-month:text-muted-foreground/40",
                          "unavailable:text-muted-foreground/30 unavailable:cursor-default",
                          "pressed:scale-95 transition-transform",
                          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                        )}
                      />
                    )}
                  </CalendarGridBody>
                </CalendarGrid>
              </Calendar>
              
              {/* Presets панель */}
              {showPresets && (
                <div className="border-l border-border w-40 flex-shrink-0">
                  <div className="p-3 space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Быстрый выбор</h4>
                    {DATE_PRESETS.map((preset) => {
                      const presetDate = preset.getValue()
                      const calendarDate = new CalendarDate(
                        presetDate.getFullYear(),
                        presetDate.getMonth() + 1,
                        presetDate.getDate()
                      )
                      
                      return (
                        <ShadcnButton
                          key={preset.label}
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePresetClick(calendarDate)}
                          className="w-full justify-start text-left h-auto py-2 px-3 flex-col items-start gap-1"
                        >
                          <span className="text-sm font-medium">{preset.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(presetDate, "dd.MM, EEEEEE", { locale: ru })}
                          </span>
                        </ShadcnButton>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </Dialog>
        </Popover>
        
        {/* Error отображение */}
        {error && (
          <Text className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <span>{error}</span>
          </Text>
        )}
        </DatePicker>
      </I18nProvider>
    </div>
  )
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

// Улучшенный компонент UPC с popover валидацией
function EnhancedUPCInput({
  value,
  onChange,
  error
}: {
  value?: string
  onChange: (value: string) => void
  error?: string
}) {
  const [showPopover, setShowPopover] = useState(false)
  const [popoverPosition, setPopoverPosition] = useState<'bottom' | 'top'>('bottom')
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  // Валидация UPC формата
  const isValidUPC = (upc: string) => {
    if (!upc) return true // Пустое значение допустимо
    const digitsOnly = upc.replace(/\D/g, '')
    return [8, 12, 13].includes(digitsOnly.length) && /^\d+$/.test(digitsOnly)
  }
  
  // Определение формата UPC
  const getUPCFormat = (upc: string) => {
    if (!upc) return null
    const digitsOnly = upc.replace(/\D/g, '')
    if (digitsOnly.length === 8) return 'UPC-E (8 цифр)'
    if (digitsOnly.length === 12) return 'UPC-A (12 цифр)'
    if (digitsOnly.length === 13) return 'EAN-13 (13 цифр)'
    return null
  }
  
  const hasValidationError = value && !isValidUPC(value)
  const detectedFormat = getUPCFormat(value || '')
  const isComplete = value && [8, 12, 13].includes(value.replace(/\D/g, '').length)
  
  // Открытие/закрытие popover только по клику на иконку
  const togglePopover = () => {
    if (!showPopover && containerRef.current) {
      // Определяем позицию popover в зависимости от доступного места
      const rect = containerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - rect.bottom
      const spaceAbove = rect.top
      
      // Popover высотой примерно 400px, если снизу мало места - показываем сверху
      if (spaceBelow < 400 && spaceAbove > 300) {
        setPopoverPosition('top')
      } else {
        setPopoverPosition('bottom')
      }
    }
    setShowPopover(!showPopover)
  }
  
  return (
    <div ref={containerRef} className="relative space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium text-foreground">UPC код</h3>
        <HelpTooltip>
          <div className="space-y-2">
            <p><strong>UPC (Universal Product Code)</strong> — уникальный идентификатор релиза для дистрибуции.</p>
            <p>Используется магазинами (iTunes, Spotify, Amazon) для каталогизации и продаж.</p>
          </div>
        </HelpTooltip>
      </div>
      
      <div className="relative">
        <UPCInput
          label=""
          value={value}
          onChange={onChange}
          placeholder="Укажите UPC код, если есть — иначе мы сгенерируем автоматически"
          error={hasValidationError ? "Неверный формат UPC кода" : undefined}
          showHelpButton={true}
          onHelpClick={togglePopover}
        />
        
        {/* Popover справки - открывается по клику на иконку */}
        {showPopover && (
          <>
            {/* Overlay для закрытия при клике вне popover */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setShowPopover(false)}
            />
            
            <div className={cn(
              "absolute right-0 w-80 z-50",
              popoverPosition === 'bottom' ? "top-full mt-2" : "bottom-full mb-2"
            )}>
              <div className="bg-popover border border-border rounded-md shadow-lg p-4">
                <div className="space-y-4">
                  {/* Заголовок */}
                  <div className="flex items-center gap-2">
                    <InfoIcon className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm text-foreground">UPC код - справка</h4>
                  </div>
                  
                  {/* Real-time статус текущего ввода */}
                  {value && (
                    <div className="bg-muted/30 rounded-md p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm">{value}</span>
                        {hasValidationError ? (
                          <div className="flex items-center gap-1">
                            <AlertCircleIcon className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Неверный формат</span>
                          </div>
                        ) : isComplete ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle2Icon className="h-3 w-3 text-primary" />
                            <span className="text-xs text-primary">Корректный UPC</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <AlertTriangleIcon className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Ввод...</span>
                          </div>
                        )}
                      </div>
                      
                      {detectedFormat && (
                        <div className="text-xs text-muted-foreground">
                          Формат: {detectedFormat}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Поддерживаемые форматы */}
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm text-foreground">Поддерживаемые форматы:</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-mono">12345678</span>
                        <span className="text-muted-foreground">UPC-E (8 цифр)</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-mono">123456789012</span>
                        <span className="text-muted-foreground">UPC-A (12 цифр)</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-mono">1234567890123</span>
                        <span className="text-muted-foreground">EAN-13 (13 цифр)</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Важная информация */}
                  <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <InfoIcon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-xs">
                        <p className="text-foreground font-medium mb-1">Нет UPC кода?</p>
                        <p className="text-muted-foreground">
                          Не волнуйтесь! Если у вас нет собственного UPC кода, мы автоматически сгенерируем уникальный идентификатор при распространении релиза.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Отображение внешних ошибок валидации - absolute positioning */}
      {error && !hasValidationError && (
        <div className="absolute left-0 top-full mt-2 z-30 text-sm animate-fade-in">
          <div className="flex items-center gap-2 text-destructive bg-background/95 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-destructive/20 shadow-xl font-medium">
            <AlertCircleIcon className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Дополнительный отступ снизу для консистентности с другими контейнерами */}
      <div className="h-4" />
    </div>
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
    <div className="professional-card p-8">
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
          <EnhancedDatePicker
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
          <EnhancedDatePicker
            value={formData.originalReleaseDate}
            onChange={handleOriginalReleaseChange}
            label="Дата оригинального релиза"
            placeholder="Выберите оригинальную дату"
            error={errors.originalReleaseDate}
          />
        </div>

        {/* Информационный блок с валидацией дат - только для будущих релизов */}
        <div key={`release-validation-${formData.releaseDate}`}>
          {formData.releaseDate && (() => {
            const releaseDate = new Date(formData.releaseDate)
            const today = new Date()
            const daysUntilRelease = Math.ceil((releaseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            const isWarning = daysUntilRelease < 14
            
            // Показываем подсказки только для будущих релизов
            if (daysUntilRelease <= 0) return null
            
            return (
              <div className={cn(
                "border rounded-lg p-4",
                isWarning 
                  ? "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800" 
                  : "bg-accent/30 border-accent"
              )}>
                <div className="flex items-start gap-3">
                  {isWarning ? (
                    <AlertTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle2Icon className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      {isWarning 
                        ? `Внимание! До релиза осталось ${daysUntilRelease} ${daysUntilRelease === 1 ? 'день' : daysUntilRelease < 5 ? 'дня' : 'дней'}`
                        : `Релиз запланирован на ${format(releaseDate, "dd MMMM yyyy", { locale: ru })}`
                      }
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {isWarning ? (
                        <>
                          <p>• ⚠️ Возможны ограничения по питчингу в плейлисты</p>
                          <p>• ⚠️ Недостаточно времени для полноценной промо-кампании</p>
                          <p>• Рекомендуем перенести релиз на более позднюю дату</p>
                        </>
                      ) : (
                        <>
                          <p>• Загрузите материалы минимум за 2 недели до релиза</p>
                          <p>• Питчинг в плейлисты Spotify открывается за 4 недели</p>
                          <p>• Пресс-релизы лучше отправлять за 6-8 недель</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* UPC код с улучшенным интерфейсом */}
        <EnhancedUPCInput
          value={formData.upc}
          onChange={(value) => onInputChange('upc', value)}
          error={errors.upc}
        />
      </div>
    </div>
  )
}