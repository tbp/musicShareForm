'use client'

import React, { useState, useCallback } from 'react'
import { AnimatedInput } from '@/components/ui/animated-input'

interface ISNIInputProps {
  id?: string
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
}

// Функция для форматирования ISNI
const formatISNI = (value: string): string => {
  // Убираем все кроме цифр
  const digits = value.replace(/\D/g, '')
  
  // Ограничиваем до 16 цифр
  const limitedDigits = digits.slice(0, 16)
  
  // Форматируем как 0000-0000-0000-0000
  if (limitedDigits.length <= 4) {
    return limitedDigits
  } else if (limitedDigits.length <= 8) {
    return `${limitedDigits.slice(0, 4)}-${limitedDigits.slice(4)}`
  } else if (limitedDigits.length <= 12) {
    return `${limitedDigits.slice(0, 4)}-${limitedDigits.slice(4, 8)}-${limitedDigits.slice(8)}`
  } else {
    return `${limitedDigits.slice(0, 4)}-${limitedDigits.slice(4, 8)}-${limitedDigits.slice(8, 12)}-${limitedDigits.slice(12)}`
  }
}

// Функция валидации ISNI
const validateISNI = (value: string): { isValid: boolean; errorMessage?: string } => {
  if (!value.trim()) {
    return { isValid: true } // Пустое значение валидно
  }
  
  const digits = value.replace(/\D/g, '')
  
  if (digits.length < 16) {
    return { 
      isValid: false, 
      errorMessage: 'ISNI должен содержать 16 цифр' 
    }
  }
  
  if (digits.length === 16) {
    return { isValid: true }
  }
  
  return { 
    isValid: false, 
    errorMessage: 'Неверный формат ISNI' 
  }
}

export function ISNIInput({
  id = 'isni',
  label = 'ISNI',
  value,
  onChange,
  placeholder = '0000-0000-0000-0000',
  className
}: ISNIInputProps) {
  const [isTouched, setIsTouched] = useState(false)
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formattedValue = formatISNI(inputValue)
    
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
  
  const validation = validateISNI(value)
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
        pattern="\d{4}-\d{4}-\d{4}-\d{4}"
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