import type { TrackFileItem, TrackValidationResult, TrackRequirements, TrackMetadata } from '../types/track-collection.types'

// Стандартные требования для аудио файлов
export const DEFAULT_TRACK_REQUIREMENTS: TrackRequirements = {
  maxSizeMB: 100,
  allowedFormats: [
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/wave',
    'audio/flac',
    'audio/aac',
    'audio/m4a',
    'audio/ogg'
  ],
  maxDurationMinutes: 30,
  minBitrate: 128
}

// Получение иконки для типа файла
export const getFileIcon = (file: File) => {
  if (file.type.startsWith('audio/')) {
    return 'Music'
  }
  if (file.type.startsWith('image/')) {
    return 'Image'
  }
  return 'File'
}

// Форматирование размера файла
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Форматирование длительности
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Определение формата аудио файла
export const getAudioFormat = (file: File): string => {
  const mimeType = file.type.toLowerCase()
  const extension = file.name.split('.').pop()?.toLowerCase()

  if (mimeType.includes('mp3') || mimeType.includes('mpeg')) return 'MP3'
  if (mimeType.includes('wav') || mimeType.includes('wave')) return 'WAV'
  if (mimeType.includes('flac')) return 'FLAC'
  if (mimeType.includes('aac') || mimeType.includes('m4a')) return 'AAC'
  if (mimeType.includes('ogg')) return 'OGG'

  // Fallback to extension
  if (extension === 'mp3') return 'MP3'
  if (extension === 'wav') return 'WAV'
  if (extension === 'flac') return 'FLAC'
  if (extension === 'aac' || extension === 'm4a') return 'AAC'
  if (extension === 'ogg') return 'OGG'

  return 'Unknown'
}

// Валидация аудио файла
export const validateTrackFile = (
  file: File,
  requirements: TrackRequirements = DEFAULT_TRACK_REQUIREMENTS
): TrackValidationResult => {
  const warnings: string[] = []

  // Проверка типа файла
  if (!requirements.allowedFormats.includes(file.type)) {
    // Проверяем по расширению как fallback
    const extension = file.name.split('.').pop()?.toLowerCase()
    const extensionValid = [
      'mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg'
    ].includes(extension || '')

    if (!extensionValid) {
      const formats = requirements.allowedFormats
        .map(f => f.split('/')[1].toUpperCase())
        .join(', ')
      return {
        isValid: false,
        error: `Неподдерживаемый формат. Разрешены: ${formats}`
      }
    }
  }

  // Проверка размера файла
  const fileSizeMB = file.size / 1024 / 1024
  if (fileSizeMB > requirements.maxSizeMB) {
    return {
      isValid: false,
      error: `Размер файла не должен превышать ${requirements.maxSizeMB}МБ (текущий: ${fileSizeMB.toFixed(1)}МБ)`
    }
  }

  // Рекомендации по качеству
  const format = getAudioFormat(file)
  if (format === 'WAV' || format === 'FLAC') {
    warnings.push('Высокое качество звука')
  } else if (format === 'MP3' && fileSizeMB > 10) {
    warnings.push('Хорошее качество для MP3')
  }

  // Проверка размера файла для рекомендаций
  if (fileSizeMB > 50) {
    warnings.push('Большой файл - проверьте необходимость такого размера')
  } else if (fileSizeMB < 1) {
    warnings.push('Маленький файл - проверьте качество звука')
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

// Извлечение метаданных из аудио файла (базовая версия)
export const extractTrackMetadata = async (file: File): Promise<Partial<TrackMetadata>> => {
  return new Promise((resolve) => {
    const audio = new Audio()
    const url = URL.createObjectURL(file)
    
    audio.addEventListener('loadedmetadata', () => {
      const metadata: Partial<TrackMetadata> = {
        duration: audio.duration || 0,
        format: getAudioFormat(file)
      }
      
      URL.revokeObjectURL(url)
      resolve(metadata)
    })

    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url)
      resolve({
        format: getAudioFormat(file)
      })
    })

    audio.src = url
  })
}

// Создание TrackFileItem из File
export const createTrackFileItem = async (
  file: File,
  requirements?: TrackRequirements
): Promise<TrackFileItem> => {
  // Валидация
  const validation = validateTrackFile(file, requirements)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }

  // Извлечение метаданных
  const metadata = await extractTrackMetadata(file)

  return {
    id: crypto.randomUUID(),
    file,
    metadata
  }
}

// Проверка является ли файл аудио
export const isAudioFile = (file: File): boolean => {
  return file.type.startsWith('audio/') || 
         /\.(mp3|wav|flac|aac|m4a|ogg)$/i.test(file.name)
}

// Получение информации о файле для отображения
export const getTrackDisplayInfo = (trackItem: TrackFileItem) => {
  const size = formatFileSize(trackItem.file.size)
  const format = trackItem.metadata?.format || getAudioFormat(trackItem.file)
  const duration = trackItem.metadata?.duration 
    ? formatDuration(trackItem.metadata.duration)
    : 'Неизвестно'
  
  return {
    name: trackItem.file.name,
    size,
    format,
    duration,
    bitrate: trackItem.metadata?.bitrate ? `${trackItem.metadata.bitrate}kbps` : undefined
  }
}