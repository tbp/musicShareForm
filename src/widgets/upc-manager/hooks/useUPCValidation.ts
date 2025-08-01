import { useState, useCallback, useMemo } from 'react'
import type { UPCFormat, UPCState, UPCValidationResult } from '../types/upc.types'
import { validateUPC, generateUPC, formatUPC } from '../utils/upcValidation'

export function useUPCValidation(initialValue: string = '') {
  const [value, setValue] = useState(initialValue)

  // Валидация и состояние UPC
  const validation = useMemo((): UPCValidationResult => {
    return validateUPC(value)
  }, [value])

  // Форматированное значение для отображения
  const displayValue = useMemo(() => formatUPC(value), [value])

  // Обновление значения
  const updateValue = useCallback((newValue: string) => {
    // Убираем все кроме цифр и ограничиваем до 13 символов
    const cleanValue = newValue.replace(/\D/g, '').slice(0, 13)
    setValue(cleanValue)
  }, [])

  // Очистка значения
  const clearValue = useCallback(() => {
    setValue('')
  }, [])

  // Генерация случайного UPC
  const generateRandomUPC = useCallback((format: UPCFormat = 'UPC-A') => {
    const randomUPC = generateUPC(format)
    setValue(randomUPC)
    return randomUPC
  }, [])

  // Состояние UPC
  const state: UPCState = useMemo(() => ({
    value,
    format: validation.format,
    isValid: validation.isValid,
    isComplete: validation.isComplete,
    errors: validation.error ? [validation.error] : []
  }), [value, validation])

  return {
    // Значения
    value,
    displayValue,
    validation,
    state,
    
    // Действия
    updateValue,
    clearValue,
    generateRandomUPC,
    
    // Состояние для удобства
    isValid: validation.isValid,
    isComplete: validation.isComplete,
    format: validation.format,
    error: validation.error
  }
}