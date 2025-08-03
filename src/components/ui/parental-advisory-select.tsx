'use client'

import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface ParentalAdvisoryOption {
  value: string
  label: string
  hint: string
}

interface ParentalAdvisorySelectProps {
  label?: string
  options: ParentalAdvisoryOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  className?: string
}

export function ParentalAdvisorySelect({
  label,
  options,
  value,
  onValueChange,
  placeholder = "Выберите...",
  required = false,
  error,
  className
}: ParentalAdvisorySelectProps) {
  // Найти выбранную опцию для отображения в trigger
  const selectedOption = options.find(option => option.value === value)

  return (
    <div className={cn('space-y-2', className)}>
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
      
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger 
          className={cn(
            'h-14 min-h-[3rem] py-3',
            error && 'border-destructive',
            !selectedOption && 'text-muted-foreground'
          )}
        >
          <SelectValue placeholder={placeholder}>
            {selectedOption ? (
              <div className="flex flex-col items-start text-left">
                <div className="text-sm font-medium text-foreground">
                  {selectedOption.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedOption.hint}
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="h-auto py-4 cursor-pointer"
            >
              <div className="flex flex-col items-start">
                <div className="text-sm font-medium">
                  {option.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {option.hint}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}