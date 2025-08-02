import type { UPCFormat, UPCFormatInfo, UPCValidationResult } from '../types/upc.types'

// Форматы UPC/EAN
export const UPC_FORMATS: Record<UPCFormat, UPCFormatInfo> = {
  'UPC-A': { length: 12, pattern: '000000000000', description: '12 цифр (стандарт США)' },
  'EAN-13': { length: 13, pattern: '0000000000000', description: '13 цифр (европейский стандарт)' },
  'UPC-E': { length: 8, pattern: '00000000', description: '8 цифр (сокращенный)' }
}

// Функция для форматирования UPC (добавление дефисов для читаемости)
export const formatUPC = (input: string): string => {
  const numbers = input.replace(/\D/g, '') // Убираем все кроме цифр
  
  if (numbers.length <= 8) {
    // UPC-E: 0-000000-0
    return numbers.replace(/(\d{1})(\d{1,6})(\d{1})?/, (_, p1, p2, p3) => {
      if (p3) return `${p1}-${p2}-${p3}`
      if (p2) return `${p1}-${p2}`
      return p1
    })
  } else if (numbers.length <= 12) {
    // UPC-A: 0-00000-00000-0
    return numbers.replace(/(\d{1})(\d{1,5})(\d{1,5})?(\d{1})?/, (_, p1, p2, p3, p4) => {
      if (p4) return `${p1}-${p2}-${p3}-${p4}`
      if (p3) return `${p1}-${p2}-${p3}`
      if (p2) return `${p1}-${p2}`
      return p1
    })
  } else {
    // EAN-13: 000-0000-0000-0
    return numbers.replace(/(\d{1,3})(\d{1,4})?(\d{1,4})?(\d{1})?/, (_, p1, p2, p3, p4) => {
      if (p4) return `${p1}-${p2}-${p3}-${p4}`
      if (p3) return `${p1}-${p2}-${p3}`
      if (p2) return `${p1}-${p2}`
      return p1
    })
  }
}

// Определяем формат по длине
export const detectFormat = (input: string): UPCFormat | null => {
  const numbers = input.replace(/\D/g, '')
  const length = numbers.length

  if (length === 8) return 'UPC-E'
  if (length === 12) return 'UPC-A'
  if (length === 13) return 'EAN-13'
  
  return null
}

// Валидация контрольной суммы для UPC-A и EAN-13
export const validateChecksum = (numbers: string): boolean => {
  if (numbers.length === 12) {
    // UPC-A валидация
    let sum = 0
    for (let i = 0; i < 11; i++) {
      sum += parseInt(numbers[i]) * (i % 2 === 0 ? 3 : 1)
    }
    const checkDigit = (10 - (sum % 10)) % 10
    return checkDigit === parseInt(numbers[11])
  }
  
  if (numbers.length === 13) {
    // EAN-13 валидация
    let sum = 0
    for (let i = 0; i < 12; i++) {
      sum += parseInt(numbers[i]) * (i % 2 === 0 ? 1 : 3)
    }
    const checkDigit = (10 - (sum % 10)) % 10
    return checkDigit === parseInt(numbers[12])
  }
  
  return true // Для UPC-E и неполных кодов
}

// Полная валидация UPC кода
export const validateUPC = (value: string): UPCValidationResult => {
  const numbers = value.replace(/\D/g, '')
  const format = detectFormat(numbers)
  
  if (!format) {
    // Определяем более конкретную ошибку в зависимости от длины
    let errorMessage: string | undefined
    
    if (numbers.length === 0) {
      // Пустое значение не является ошибкой - позволяем пользователю вводить
      errorMessage = undefined
    } else if (numbers.length < 8) {
      // Промежуточный ввод - не показываем ошибку до достижения минимального размера
      errorMessage = undefined  
    } else if (numbers.length > 13) {
      errorMessage = 'UPC код не может содержать больше 13 цифр'
    } else {
      errorMessage = `${numbers.length} цифр не соответствует ни одному формату UPC (8, 12 или 13 цифр)`
    }
    
    return {
      isValid: false,
      format: null,
      isComplete: false,
      checksum: false,
      error: errorMessage
    }
  }
  
  const isComplete = numbers.length === UPC_FORMATS[format].length
  const checksum = isComplete ? validateChecksum(numbers) : true
  const isValid = isComplete && checksum
  
  return {
    isValid,
    format,
    isComplete,
    checksum,
    error: isComplete && !checksum ? 'Неверная контрольная сумма' : undefined
  }
}

// Генерация случайного валидного UPC кода
export const generateUPC = (format: UPCFormat = 'UPC-A'): string => {
  const formatInfo = UPC_FORMATS[format]
  let numbers = ''
  
  // Генерируем случайные цифры (кроме последней - контрольной суммы)
  for (let i = 0; i < formatInfo.length - 1; i++) {
    numbers += Math.floor(Math.random() * 10).toString()
  }
  
  // Вычисляем контрольную сумму
  if (format === 'UPC-A') {
    let sum = 0
    for (let i = 0; i < 11; i++) {
      sum += parseInt(numbers[i]) * (i % 2 === 0 ? 3 : 1)
    }
    const checkDigit = (10 - (sum % 10)) % 10
    numbers += checkDigit.toString()
  } else if (format === 'EAN-13') {
    let sum = 0
    for (let i = 0; i < 12; i++) {
      sum += parseInt(numbers[i]) * (i % 2 === 0 ? 1 : 3)
    }
    const checkDigit = (10 - (sum % 10)) % 10
    numbers += checkDigit.toString()
  } else {
    // Для UPC-E просто добавляем случайную цифру
    numbers += Math.floor(Math.random() * 10).toString()
  }
  
  return numbers
}