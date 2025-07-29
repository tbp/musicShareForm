'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Check, Hash, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UPCInputProps {
  label?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

// Форматы UPC/EAN
const UPC_FORMATS = {
  'UPC-A': { length: 12, pattern: '000000000000', description: '12 цифр (стандарт США)' },
  'EAN-13': { length: 13, pattern: '0000000000000', description: '13 цифр (европейский стандарт)' },
  'UPC-E': { length: 8, pattern: '00000000', description: '8 цифр (сокращенный)' }
}

export function UPCInput({
  label,
  value = '',
  onChange,
  placeholder,
  error,
  hint,
  disabled = false,
  required = false,
  className,
  ...props
}: UPCInputProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const [detectedFormat, setDetectedFormat] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const inputId = React.useId()

  // Функция для форматирования UPC (добавление дефисов для читаемости)
  const formatUPC = (input: string): string => {
    const numbers = input.replace(/\D/g, '') // Убираем все кроме цифр
    
    if (numbers.length <= 8) {
      // UPC-E: 0-000000-0
      return numbers.replace(/(\d{1})(\d{1,6})(\d{1})?/, (_, p1, p2, p3) => {
        if (p3) return `${p1}-${p2}-${p3}`
        if (p2) return `${p1}-${p2}`
        return p1
      })
    } else if (numbers.length <= 12) {
      // UPC-A: 0-00000-00000-0
      return numbers.replace(/(\d{1})(\d{1,5})(\d{1,5})?(\d{1})?/, (_, p1, p2, p3, p4) => {
        if (p4) return `${p1}-${p2}-${p3}-${p4}`
        if (p3) return `${p1}-${p2}-${p3}`
        if (p2) return `${p1}-${p2}`
        return p1
      })
    } else {
      // EAN-13: 000-0000-0000-0
      return numbers.replace(/(\d{1,3})(\d{1,4})?(\d{1,4})?(\d{1})?/, (_, p1, p2, p3, p4) => {
        if (p4) return `${p1}-${p2}-${p3}-${p4}`
        if (p3) return `${p1}-${p2}-${p3}`
        if (p2) return `${p1}-${p2}`
        return p1
      })
    }
  }

  // Определяем формат по длине
  const detectFormat = (input: string): string | null => {
    const numbers = input.replace(/\D/g, '')
    const length = numbers.length

    if (length === 8) return 'UPC-E'
    if (length === 12) return 'UPC-A'
    if (length === 13) return 'EAN-13'
    
    return null
  }

  // Валидация контрольной суммы для UPC-A и EAN-13
  const validateChecksum = (numbers: string): boolean => {
    if (numbers.length === 12) {
      // UPC-A валидация
      let sum = 0
      for (let i = 0; i < 11; i++) {
        sum += parseInt(numbers[i]) * (i % 2 === 0 ? 3 : 1)
      }
      const checkDigit = (10 - (sum % 10)) % 10
      return checkDigit === parseInt(numbers[11])
    }
    
    if (numbers.length === 13) {
      // EAN-13 валидация
      let sum = 0
      for (let i = 0; i < 12; i++) {
        sum += parseInt(numbers[i]) * (i % 2 === 0 ? 1 : 3)
      }
      const checkDigit = (10 - (sum % 10)) % 10
      return checkDigit === parseInt(numbers[12])
    }
    
    return true // Для UPC-E и неполных кодов
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numbers = inputValue.replace(/\D/g, '') // Убираем все кроме цифр
    
    // Ограничиваем до 13 цифр максимум
    if (numbers.length > 13) return
    
    const format = detectFormat(numbers)
    
    setDetectedFormat(format)
    onChange?.(numbers) // Отправляем только цифры в родительский компонент
  }

  const displayValue = formatUPC(value)
  const numbers = value.replace(/\D/g, '')
  const isComplete = detectedFormat && numbers.length === UPC_FORMATS[detectedFormat as keyof typeof UPC_FORMATS].length
  const isValid = isComplete && validateChecksum(numbers)

  const isLabelFloating = isFocused || value.length > 0

  return (
    <div className={cn('relative', className)}>
      {/* Floating Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'absolute left-3 pointer-events-none transition-all duration-200 ease-out z-10',
            'select-none bg-background px-1',
            
            // Animation states
            isLabelFloating
              ? 'top-0 text-xs -translate-y-1/2'
              : 'top-1/2 -translate-y-1/2 text-base',
            
            // Color states
            isFocused ? 'text-primary' : 'text-muted-foreground',
            error ? 'text-destructive' : '',
          )}
        >
          {label}
          {required && (
            <span className={cn(
              'ml-1',
              error ? 'text-destructive' : isFocused ? 'text-primary' : 'text-destructive'
            )}>
              *
            </span>
          )}
        </label>
      )}

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={label ? ' ' : placeholder}
          className={cn(
            // Base styles
            'peer w-full bg-background border border-input rounded-lg px-3 text-foreground font-mono',
            'placeholder:text-transparent placeholder-shown:border-input',
            'transition-all duration-200 ease-out',
            'focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary',
            
            // Padding based on label presence
            label ? 'pt-6 pb-2' : 'py-3',
            
            // Icon padding (для статуса + справки)
            'pr-12',
            
            // Error states
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            
            // Success states
            isValid && 'border-success focus:border-success focus:ring-success/20',
            
            className
          )}
          {...props}
        />

        {/* Status Icon with Tooltip */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isComplete && isValid && (
            <Check className="h-4 w-4 text-success" />
          )}
          {!isComplete && numbers.length > 0 && (
            <Hash className="h-4 w-4 text-muted-foreground" />
          )}
          
          {/* Help tooltip */}
          <PopoverPrimitive.Root>
            <PopoverPrimitive.Trigger asChild>
              <button
                type="button"
                className="ml-1 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Справка по форматам UPC"
              >
                <HelpCircle className="h-3 w-3" />
              </button>
            </PopoverPrimitive.Trigger>
            <PopoverPrimitive.Portal>
              <PopoverPrimitive.Content
                className={cn(
                  'z-50 w-80 rounded-lg border bg-popover p-4 text-popover-foreground shadow-lg',
                  'data-[state=open]:animate-in data-[state=closed]:animate-out',
                  'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                  'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                  'data-[side=bottom]:slide-in-from-top-2'
                )}
                sideOffset={4}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Поддерживаемые форматы:</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-mono">123456789012</span>
                      <span className="text-muted-foreground">UPC-A (12 цифр)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-mono">1234567890123</span>
                      <span className="text-muted-foreground">EAN-13 (13 цифр)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-mono">12345670</span>
                      <span className="text-muted-foreground">UPC-E (8 цифр)</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                    Коды автоматически валидируются и форматируются
                  </div>
                </div>
                <PopoverPrimitive.Arrow className="fill-popover" />
              </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
          </PopoverPrimitive.Root>
        </div>
      </div>

      {/* Format Detection Info */}
      {detectedFormat && (
                 <div className="mt-1.5 flex items-center gap-2 text-xs">
           <div className={cn(
             'px-2 py-1 rounded text-xs font-medium upc-format-badge',
             isValid 
               ? 'bg-success/10 text-success border border-success/20'
               : 'bg-info/10 text-info border border-info/20'
           )}>
             {detectedFormat}
           </div>
          <span className="text-muted-foreground">
            {UPC_FORMATS[detectedFormat as keyof typeof UPC_FORMATS].description}
          </span>
          {isComplete && !isValid && (
            <span className="text-destructive">Неверная контрольная сумма</span>
          )}
        </div>
      )}

      {/* Helper Text / Error Message */}
      {(hint || error) && (
        <div className="mt-1.5 text-xs">
          {error ? (
            <span className="text-destructive animate-fade-in">
              {error}
            </span>
          ) : hint ? (
            <span className="text-muted-foreground">
              {hint}
            </span>
          ) : null}
        </div>
      )}

    </div>
  )
} 