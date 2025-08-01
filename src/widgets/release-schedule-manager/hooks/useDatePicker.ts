import { useState, useCallback, useMemo } from 'react'
import type { ScheduleState, DateValidationResult } from '../types/schedule.types'
import { validateReleaseDate, getReleaseDateInfo, getMinimumDate } from '../utils/dateUtils'

export function useDatePicker(
  initialReleaseDate: string = '',
  initialOriginalReleaseDate: string = ''
) {
  const [releaseDate, setReleaseDate] = useState(initialReleaseDate)
  const [originalReleaseDate, setOriginalReleaseDate] = useState(initialOriginalReleaseDate)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Состояние связи между датами
  const [isLinked, setIsLinked] = useState(() => {
    // Связь активна если даты одинаковые или оригинальная дата пустая
    return !initialOriginalReleaseDate || initialReleaseDate === initialOriginalReleaseDate
  })

  // Валидация даты релиза
  const releaseDateValidation = useMemo((): DateValidationResult => {
    return validateReleaseDate(releaseDate)
  }, [releaseDate])

  // Информация о дате релиза
  const releaseDateInfo = useMemo(() => {
    return getReleaseDateInfo(releaseDate)
  }, [releaseDate])

  // Минимальная дата
  const minDate = useMemo(() => getMinimumDate(), [])

  // Состояние виджета
  const state: ScheduleState = useMemo(() => ({
    releaseDate,
    originalReleaseDate,
    isLinked,
    errors
  }), [releaseDate, originalReleaseDate, isLinked, errors])

  // Обработка изменения даты цифрового релиза
  const handleReleaseDateChange = useCallback((date: string) => {
    setReleaseDate(date)
    
    // Очистка ошибок
    setErrors(prev => {
      const { releaseDate: _, ...rest } = prev
      return rest
    })
    
    // Если связь активна - синхронизируем оригинальную дату
    if (isLinked) {
      setOriginalReleaseDate(date)
    }
  }, [isLinked])

  // Обработка изменения оригинальной даты
  const handleOriginalReleaseDateChange = useCallback((date: string) => {
    setOriginalReleaseDate(date)
    
    // Очистка ошибок
    setErrors(prev => {
      const { originalReleaseDate: _, ...rest } = prev
      return rest
    })
    
    // Если пользователь изменил оригинальную дату на другую - разрываем связь
    if (date !== releaseDate) {
      setIsLinked(false)
    } else {
      // Если даты снова совпали - восстанавливаем связь
      setIsLinked(true)
    }
  }, [releaseDate])

  // Переключение состояния связи
  const toggleLink = useCallback(() => {
    if (isLinked) {
      // Разрываем связь
      setIsLinked(false)
    } else {
      // Восстанавливаем связь - синхронизируем даты
      setIsLinked(true)
      setOriginalReleaseDate(releaseDate)
    }
  }, [isLinked, releaseDate])

  // Установка ошибки
  const setError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [])

  // Очистка ошибок
  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  // Обновление дат извне
  const updateDates = useCallback((newReleaseDate: string, newOriginalReleaseDate: string) => {
    setReleaseDate(newReleaseDate)
    setOriginalReleaseDate(newOriginalReleaseDate)
    
    // Обновление состояния связи
    const newIsLinked = !newOriginalReleaseDate || newReleaseDate === newOriginalReleaseDate
    setIsLinked(newIsLinked)
    
    setErrors({})
  }, [])

  return {
    // Состояние
    releaseDate,
    originalReleaseDate,
    isLinked,
    errors,
    state,
    
    // Валидация и информация
    releaseDateValidation,
    releaseDateInfo,
    minDate,
    
    // Действия
    handleReleaseDateChange,
    handleOriginalReleaseDateChange,
    toggleLink,
    setError,
    clearErrors,
    updateDates,
    
    // Вычисляемые значения
    hasReleaseDate: Boolean(releaseDate),
    hasOriginalReleaseDate: Boolean(originalReleaseDate),
    isValidReleaseDate: releaseDateValidation.isValid,
    hasErrors: Object.keys(errors).length > 0
  }
}