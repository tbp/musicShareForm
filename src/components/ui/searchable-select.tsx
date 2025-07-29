'use client'

import * as React from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SearchableOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SearchableSelectProps {
  label?: string
  options: SearchableOption[]
  value: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

const SearchableSelect = React.forwardRef<HTMLDivElement, SearchableSelectProps>(
  ({ 
    label,
    options,
    value,
    onValueChange,
    placeholder = 'Выберите...',
    searchPlaceholder = 'Поиск...',
    emptyMessage = 'Ничего не найдено',
    error,
    hint,
    required = false,
    disabled = false,
    className
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState('')
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Фильтрация опций по поисковому запросу
    const filteredOptions = React.useMemo(() => {
      if (!searchQuery) return options
      return options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }, [options, searchQuery])

    // Выбранная опция
    const selectedOption = options.find(option => option.value === value)

    // Закрытие при клике вне
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
          setSearchQuery('')
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Обработка выбора опции
    const handleOptionSelect = (optionValue: string) => {
      onValueChange?.(optionValue)
      setIsOpen(false)
      setSearchQuery('')
    }

    // Очистка выбора
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation()
      onValueChange?.('')
    }

    return (
      <div ref={ref} className={cn('relative', className)}>
        {label && (
          <label
            className={cn(
              'block text-sm font-medium text-foreground mb-2',
              required && "after:content-['*'] after:text-destructive after:ml-1"
            )}
          >
            {label}
          </label>
        )}

        <div ref={containerRef} className="relative">
          {/* Триггер */}
          <div
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={cn(
              'relative w-full cursor-pointer rounded-lg border border-input bg-background px-3 py-3 text-left shadow-sm transition-all',
              'focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary',
              'hover:border-primary/50',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
              isOpen && 'border-primary ring-2 ring-ring/20',
              disabled && 'pointer-events-none opacity-50'
            )}
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if (disabled) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setIsOpen(!isOpen)
              }
            }}
          >
            <span className={cn(
              'block truncate text-sm',
              selectedOption ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            
            <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3 pointer-events-none">
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </div>
          </div>
          
          {/* Кнопка очистки - вынесена отдельно */}
          {selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-1/2 right-8 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded text-muted-foreground hover:text-foreground z-10 pointer-events-auto"
            >
              <X className="h-3 w-3" />
            </button>
          )}

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
              {/* Поиск */}
              <div className="relative p-3 border-b border-border">
                <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary"
                />
              </div>

              {/* Опции */}
              <div className="max-h-60 overflow-auto py-1">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleOptionSelect(option.value)}
                      disabled={option.disabled}
                      className={cn(
                        'relative w-full cursor-pointer select-none py-2 px-3 text-left text-sm transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        option.value === value && 'bg-accent text-accent-foreground'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{option.label}</span>
                        {option.value === value && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Ошибка */}
        {error && (
          <p className="text-sm text-destructive mt-2">
            {error}
          </p>
        )}

        {/* Подсказка */}
        {hint && !error && (
          <p className="text-sm text-muted-foreground mt-2">
            {hint}
          </p>
        )}
      </div>
    )
  }
)
SearchableSelect.displayName = 'SearchableSelect'

export { SearchableSelect } 