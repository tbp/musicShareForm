'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface RadioCardProps {
  value: string
  selectedValue?: string
  onValueChange?: (value: string) => void
  title: string
  description?: string
  icon?: React.ReactNode
  disabled?: boolean
  className?: string
}

const RadioCard = React.forwardRef<HTMLDivElement, RadioCardProps>(
  ({ value, selectedValue, onValueChange, title, description, icon, disabled = false, className }, ref) => {
    const isSelected = selectedValue === value

    return (
      <div
        ref={ref}
        className={cn(
          'radio-card',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        data-selected={isSelected}
        onClick={() => !disabled && onValueChange?.(value)}
        role="radio"
        aria-checked={isSelected}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault()
            onValueChange?.(value)
          }
        }}
      >
        <div className="flex items-center gap-3 w-full">
          {icon && (
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/8 text-primary flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-base leading-tight">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5 leading-tight truncate">{description}</p>
            )}
          </div>
          {isSelected && <div className="selection-indicator" />}
        </div>
      </div>
    )
  }
)
RadioCard.displayName = 'RadioCard'

export interface RadioCardGroupProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

const RadioCardGroup = React.forwardRef<HTMLDivElement, RadioCardGroupProps>(
  ({ value, onValueChange, children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}
        role="radiogroup"
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement<RadioCardProps>(child) && child.type === RadioCard) {
            return React.cloneElement(child, {
              selectedValue: value,
              onValueChange,
            } as Partial<RadioCardProps>)
          }
          return child
        })}
      </div>
    )
  }
)
RadioCardGroup.displayName = 'RadioCardGroup'

export { RadioCard, RadioCardGroup } 