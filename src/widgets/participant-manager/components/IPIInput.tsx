'use client'

import React, { useState, useCallback } from 'react'
import { AnimatedInput } from '@/components/ui/animated-input'

interface IPIInputProps {
  id?: string
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
}

// Функция для форматирования IPI
const formatIPI = (value: string): string => {
  // Убираем все кроме цифр
  const digits = value.replace(/\D/g, '')
  
  // Ограничиваем до 11 цифр
  return digits.slice(0, 11)
}

// Функция валидации IPI
const validateIPI = (value: string): { isValid: boolean; errorMessage?: string } => {
  if (!value.trim()) {
    return { isValid: true } // Пустое значение валидно
  }
  
  const digits = value.replace(/\D/g, '')
  
  if (digits.length < 11) {
    return { 
      isValid: false, 
      errorMessage: 'IPI должен содержать 11 цифр' 
    }
  }
  
  if (digits.length === 11) {
    return { isValid: true }
  }
  
  return { 
    isValid: false, 
    errorMessage: 'Неверный формат IPI' 
  }
}

export function IPIInput({
  id = 'ipi',
  label = 'IPI',
  value,
  onChange,
  placeholder = '00123456789',
  className
}: IPIInputProps) {
  const [isTouched, setIsTouched] = useState(false)
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formattedValue = formatIPI(inputValue)
    
    // Создаем новое событие с отформатированным значением
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: formattedValue
      }
    } as React.ChangeEvent<HTMLInputElement>
    
    onChange(syntheticEvent)
    
    // Сбрасываем touched при новом вводе после blur
    if (isTouched) {
      setIsTouched(false)
    }
  }, [onChange, isTouched])
  
  const handleBlur = useCallback(() => {
    setIsTouched(true)
  }, [])
  
  const validation = validateIPI(value)
  const showError = isTouched && !validation.isValid
  
  return (
    <div className="relative">
      <AnimatedInput
        id={id}
        label={label}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        pattern="\d{11}"
        inputMode="numeric"
        aria-invalid={showError}
        aria-describedby={showError ? `${id}-error` : undefined}
      />
      
      {showError && validation.errorMessage && (
        <div id={`${id}-error`} className="mt-1 text-xs text-destructive">
          {validation.errorMessage}
        </div>
      )}
    </div>
  )
}