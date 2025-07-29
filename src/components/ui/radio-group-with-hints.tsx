'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface RadioOption {
  value: string
  label: string
  hint?: string
  disabled?: boolean
}

export interface RadioGroupWithHintsProps {
  label?: string
  options: RadioOption[]
  value: string
  onValueChange: (value: string) => void
  error?: string
  required?: boolean
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

const RadioGroupWithHints = React.forwardRef<HTMLDivElement, RadioGroupWithHintsProps>(
  ({ 
    label, 
    options, 
    value, 
    onValueChange, 
    error, 
    required = false, 
    className,
    orientation = 'vertical'
  }, ref) => {
    const groupId = React.useId()

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {label && (
          <label
            className={cn(
              'block text-sm font-medium text-foreground',
              required && "after:content-['*'] after:text-destructive after:ml-1"
            )}
          >
            {label}
          </label>
        )}
        
        <div
          role="radiogroup"
          className={cn(
            'space-y-3',
            orientation === 'horizontal' && 'flex space-x-6 space-y-0'
          )}
        >
          {options.map((option) => {
            const isSelected = value === option.value
            const optionId = `${groupId}-${option.value}`
            
            return (
              <div key={option.value} className="relative">
                <label
                  htmlFor={optionId}
                  className={cn(
                    'flex items-start gap-3 cursor-pointer p-3 rounded-lg border-2 transition-all duration-200',
                    'hover:bg-accent/50',
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border bg-background',
                    option.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center">
                    <input
                      id={optionId}
                      type="radio"
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) => {
                        if (!option.disabled) {
                          onValueChange(e.target.value)
                        }
                      }}
                      disabled={option.disabled}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all duration-200',
                        isSelected 
                          ? 'border-primary bg-primary' 
                          : 'border-muted-foreground bg-background'
                      )}
                    >
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {option.label}
                    </div>
                    {option.hint && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {option.hint}
                      </div>
                    )}
                  </div>
                </label>
              </div>
            )
          })}
        </div>

        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    )
  }
)
RadioGroupWithHints.displayName = 'RadioGroupWithHints'

export { RadioGroupWithHints } 