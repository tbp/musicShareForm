import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { DatePreset, DateValidationResult } from '../types/schedule.types'

// Предустановки дат для удобства пользователя (сортировка: от дальних к ближним)
export const DATE_PRESETS: DatePreset[] = [
  { label: 'Через месяц', getValue: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  { label: 'Через 2 недели', getValue: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
  { label: 'Через неделю', getValue: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  { label: 'Завтра', getValue: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
]

// Валидация даты релиза
export const validateReleaseDate = (dateString: string): DateValidationResult => {
  if (!dateString) {
    return {
      isValid: false,
      error: 'Дата релиза обязательна'
    }
  }

  const releaseDate = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  releaseDate.setHours(0, 0, 0, 0)

  const daysUntilRelease = Math.ceil((releaseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  // Дата в прошлом
  if (daysUntilRelease < 0) {
    return {
      isValid: false,
      error: 'Дата релиза не может быть в прошлом'
    }
  }

  // Дата сегодня или завтра
  if (daysUntilRelease <= 1) {
    return {
      isValid: false,
      error: 'Дата релиза должна быть минимум через 2 дня'
    }
  }

  const warnings: string[] = []

  // Предупреждения для ближайших дат
  if (daysUntilRelease < 14) {
    warnings.push('Возможны ограничения по питчингу в плейлисты')
    warnings.push('Недостаточно времени для полноценной промо-кампании')
    warnings.push('Рекомендуем перенести релиз на более позднюю дату')
  } else {
    warnings.push('Загрузите материалы минимум за 2 недели до релиза')
    warnings.push('Питчинг в плейлисты Spotify открывается за 4 недели')
    warnings.push('Пресс-релизы лучше отправлять за 6-8 недель')
  }

  return {
    isValid: true,
    daysUntilRelease,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

// Форматирование даты для отображения
export const formatDisplayDate = (dateString: string, formatString: string = "dd MMMM yyyy"): string => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return format(date, formatString, { locale: ru })
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString
  }
}

// Получение информации о релизе
export const getReleaseDateInfo = (dateString: string) => {
  if (!dateString) return null

  const releaseDate = new Date(dateString)
  const today = new Date()
  const daysUntilRelease = Math.ceil((releaseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  return {
    date: releaseDate,
    daysUntilRelease,
    formattedDate: formatDisplayDate(dateString),
    formattedShort: formatDisplayDate(dateString, "dd.MM, EEEEEE"),
    isWarning: daysUntilRelease < 14,
    isInFuture: daysUntilRelease > 0
  }
}

// Проверка, является ли дата валидной строкой
export const isValidDateString = (dateString: string): boolean => {
  if (!dateString) return false
  
  try {
    const date = new Date(dateString)
    return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/) !== null
  } catch {
    return false
  }
}

// Конвертация Date в строку формата YYYY-MM-DD
export const dateToString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Получение текущей даты в формате строки
export const getTodayString = (): string => {
  return dateToString(new Date())
}

// Получение минимальной даты (завтра)
export const getMinimumDate = (): Date => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 2) // Минимум через 2 дня
  return tomorrow
}