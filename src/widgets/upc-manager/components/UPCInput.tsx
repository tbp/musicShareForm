'use client'

import * as React from 'react'
import { Check, Hash, CircleQuestionMark, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UPCInputProps, UPCFormat } from '../types/upc.types'
import { UPC_FORMATS, formatUPC, detectFormat, validateChecksum } from '../utils/upcValidation'

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
  onFocus,
  onBlur,
  showHelpButton = true,
  onHelpClick,
  ...props
}: UPCInputProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const [detectedFormat, setDetectedFormat] = React.useState<string | null>(null)
  const [isTouched, setIsTouched] = React.useState(false) // Отслеживаем был ли blur
  const inputRef = React.useRef<HTMLInputElement>(null)
  const inputId = React.useId()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numbers = inputValue.replace(/\D/g, '') // Убираем все кроме цифр
    
    // Ограничиваем до 13 цифр максимум
    if (numbers.length > 13) return
    
    const format = detectFormat(numbers)
    
    setDetectedFormat(format)
    
    // Сбрасываем touched состояние при вводе новых символов
    if (isTouched && numbers.length > value.replace(/\D/g, '').length) {
      setIsTouched(false)
    }
    
    onChange?.(numbers) // Отправляем только цифры в родительский компонент
  }

  const displayValue = formatUPC(value)
  const numbers = value.replace(/\D/g, '')
  const isComplete = detectedFormat && numbers.length === UPC_FORMATS[detectedFormat as UPCFormat].length
  const isValid = isComplete && validateChecksum(numbers)
  
  // Проверка на правильность неполного ввода
  const hasValidationError = numbers.length > 0 && (
    numbers.length > 13 || // Слишком длинный
    (isTouched && numbers.length >= 8 && !detectFormat(numbers)) || // После blur показываем ошибку для неподходящих длин (9-11)
    (isTouched && numbers.length > 0 && numbers.length < 8) // После blur показываем ошибку для неполных кодов
  )
  
  // Итоговое состояние ошибки  
  const getErrorMessage = () => {
    if (error) return error
    if (!hasValidationError) return undefined
    
    // Не показываем ошибку для пустого значения
    if (numbers.length === 0) return undefined
    
    if (numbers.length > 13) return "Слишком много цифр для UPC кода"
    if (isTouched && numbers.length >= 8 && !detectFormat(numbers)) {
      return `${numbers.length} цифр не соответствует ни одному формату UPC (8, 12 или 13 цифр)`
    }
    if (isTouched && numbers.length > 0 && numbers.length < 8) {
      return `UPC код слишком короткий (${numbers.length} из минимум 8 цифр)`
    }
    
    return "Неверный формат UPC кода"
  }
  
  const finalError = getErrorMessage()
  
  const isLabelFloating = isFocused || value.length > 0

  return (
    <div className={cn('relative', className)}>
      {/* Floating Label */}
      {label && label.trim() && (
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
            finalError ? 'text-destructive' : '',
          )}
        >
          {label}
          {required && (
            <span className={cn(
              'ml-1',
              finalError ? 'text-destructive' : isFocused ? 'text-primary' : 'text-destructive'
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
          onFocus={() => {
            setIsFocused(true)
            onFocus?.()
          }}
          onBlur={() => {
            setIsFocused(false)
            setIsTouched(true) // Помечаем что поле было затронуто
            onBlur?.()
          }}
          disabled={disabled}
          placeholder={label && label.trim() ? ' ' : placeholder}
          className={cn(
            // Base styles
            'peer w-full bg-background border border-input rounded-lg px-3 text-foreground font-mono',
            // Placeholder visibility based on label presence
            label && label.trim() 
              ? 'placeholder:text-transparent placeholder-shown:border-input'
              : 'placeholder:text-muted-foreground/70 placeholder:text-sm placeholder:font-normal',
            'transition-all duration-200 ease-out',
            'focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary',
            
            // Padding based on label presence
            label && label.trim() ? 'pt-6 pb-2' : 'py-3',
            
            // Icon padding (для статуса + справки)
            'pr-12',
            
            // Error states
            finalError && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            
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
          {isComplete && !isValid && (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          )}
          {!isComplete && numbers.length > 0 && (
            <Hash className="h-4 w-4 text-muted-foreground" />
          )}
          
          {/* Help button */}
          {showHelpButton && onHelpClick && (
            <button
              type="button"
              className="ml-1 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Справка по форматам UPC"
              onClick={onHelpClick}
            >
              <CircleQuestionMark className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Format Detection Info - показываем только при фокусе и без ошибок */}
      {detectedFormat && isFocused && !finalError && !hint && (
        <div className="absolute left-0 top-full mt-3 z-[15] text-xs animate-fade-in">
          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2.5 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className={cn(
                'px-2.5 py-1 rounded-md text-xs font-semibold border transition-all duration-200',
                isValid 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
                  : 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800'
              )}>
                {detectedFormat}
              </div>
              <span className="text-muted-foreground font-medium">
                {UPC_FORMATS[detectedFormat as UPCFormat].description}
              </span>
              {isComplete && !isValid && (
                <span className="text-destructive font-semibold animate-pulse">Неверная контрольная сумма</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Helper Text / Error Message - приоритет над format info */}
      {(hint || finalError) && (
        <div className="absolute left-0 top-full mt-2 z-20 text-xs animate-fade-in">
          {finalError ? (
            <span className="text-destructive bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-destructive/20 shadow-lg font-medium">
              {finalError}
            </span>
          ) : hint ? (
            <span className="text-muted-foreground bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border shadow-lg">
              {hint}
            </span>
          ) : null}
        </div>
      )}

    </div>
  )
}