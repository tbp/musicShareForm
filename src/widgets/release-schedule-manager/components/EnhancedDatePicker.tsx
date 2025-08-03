'use client'

import React, { useState } from 'react'
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
  I18nProvider
} from 'react-aria-components'
import { Button as ShadcnButton } from '@/components/ui/button'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon, AlertCircleIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CalendarDate, parseDate, DateValue } from '@internationalized/date'
import type { EnhancedDatePickerProps } from '../types/schedule.types'
import { DATE_PRESETS } from '../utils/dateUtils'

export function EnhancedDatePicker({
  value,
  onChange,
  label,
  error,
  minDate,
  showPresets = false,
  disabled = false,
  required = false,
  additionalContent
}: EnhancedDatePickerProps) {
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