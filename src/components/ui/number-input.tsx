'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

export interface NumberInputProps {
  label?: string
  placeholder?: string
  value?: number
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
  disabled?: boolean
}

export const NumberInput = React.forwardRef<
  HTMLInputElement,
  NumberInputProps
>(({
  label,
  placeholder,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 10,
  className,
  disabled = false
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value) || 0
    onChange?.(Math.min(Math.max(numValue, min), max))
  }

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
          {label}
        </label>
      )}
      
      <div className="relative">
        <Input
          ref={ref}
          type="number"
          placeholder={placeholder}
          value={value || ''}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="pr-8"
        />
        
        {/* Знак процента */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
          %
        </div>
      </div>
    </div>
  )
})

NumberInput.displayName = 'NumberInput'