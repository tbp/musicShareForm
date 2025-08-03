'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface YearComboboxProps {
  label?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  className?: string
  placeholder?: string
}

export function YearCombobox({
  label,
  value = '',
  onChange,
  error,
  hint,
  disabled = false,
  required = false,
  className,
  placeholder,
  ...props
}: YearComboboxProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const blurTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const inputId = React.useId()
  
  const currentYear = new Date().getFullYear()
  
  // Очистка таймера при размонтировании
  React.useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  // Компактные варианты годов
  const quickYears = React.useMemo(() => [
    { value: currentYear.toString(), label: currentYear.toString(), isCurrent: true },
    { value: (currentYear - 1).toString(), label: (currentYear - 1).toString(), isCurrent: false }
  ], [currentYear])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numericValue = inputValue.replace(/\D/g, '')
    if (numericValue.length <= 4) {
      onChange?.(numericValue)
    }
  }

  const handleYearSelect = (selectedYear: string) => {
    onChange?.(selectedYear)
  }

  const isLabelFloating = isFocused || value.length > 0
  const showQuickTags = value.length === 0

  return (
    <div className={cn('relative', className)}>
      {/* Floating Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'absolute left-3 pointer-events-none transition-all duration-200 ease-out z-10',
            'select-none bg-background px-1',
            
            isLabelFloating
              ? 'top-0 text-xs -translate-y-1/2'
              : 'top-1/2 -translate-y-1/2 text-base',
            
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

      {/* Input with Dropdown */}
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (blurTimeoutRef.current) {
              clearTimeout(blurTimeoutRef.current)
              blurTimeoutRef.current = null
            }
            setIsFocused(true)
          }}
          onBlur={() => {
            // Небольшая задержка для обработки кликов по быстрым вариантам
            blurTimeoutRef.current = setTimeout(() => setIsFocused(false), 150)
          }}
          disabled={disabled}
          placeholder={label ? ' ' : placeholder || `${currentYear}`}
          className={cn(
            'peer w-full bg-background border border-input rounded-lg px-3 text-foreground font-mono',
            'placeholder:text-transparent placeholder-shown:border-input',
            'transition-all duration-200 ease-out',
            'focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary',
            
            label ? 'pt-6 pb-2' : 'py-3',
            'pr-20', // Больше места для тегов
            
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
          )}
          {...props}
        />

        {/* Quick Year Tags - минималистичные */}
        {showQuickTags && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-auto">
            {quickYears.map((year) => (
              <button
                key={year.value}
                type="button"
                tabIndex={0}
                onMouseDown={(e) => {
                  e.preventDefault() // Предотвращаем потерю фокуса
                  handleYearSelect(year.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleYearSelect(year.value)
                  }
                }}
                className={cn(
                  'px-2 py-1 text-xs font-mono rounded transition-all duration-150',
                  'text-muted-foreground border border-transparent',
                  'hover:text-foreground hover:border-border hover:bg-accent/50',
                  'focus:text-foreground focus:border-border focus:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring/50',
                  'active:scale-95'
                )}
              >
                {year.label}
              </button>
            ))}
          </div>
        )}
      </div>

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