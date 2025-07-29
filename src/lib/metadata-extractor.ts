// Утилиты для работы с метаданными аудио файлов
export interface ExtractedMetadata {
  title?: string
  artist?: string
  album?: string
  year?: number
  genre?: string[]
  trackNumber?: number
  discNumber?: number
  duration?: number
  bitrate?: number
  sampleRate?: number
  bpm?: number
  key?: string
}

// Функция для извлечения метаданных из файла (browser-side)
export async function extractMetadataFromFile(file: File): Promise<ExtractedMetadata> {
  return new Promise((resolve) => {
    const audio = new Audio()
    const url = URL.createObjectURL(file)
    
    audio.addEventListener('loadedmetadata', () => {
      const metadata: ExtractedMetadata = {
        duration: audio.duration,
        // В браузерной версии мы ограничены в извлечении метаданных
        // Для полного извлечения ID3 тегов понадобится music-metadata на сервере
      }
      
      URL.revokeObjectURL(url)
      resolve(metadata)
    })
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url)
      resolve({})
    })
    
    audio.src = url
  })
}

// Функция для извлечения информации из имени файла
export function extractInfoFromFileName(filename: string): Partial<ExtractedMetadata> {
  const baseName = filename.replace(/\.[^/.]+$/, '') // убираем расширение
  
  // Попытка извлечь номер трека из начала имени файла
  const trackNumberMatch = baseName.match(/^(\d+)[\s\-\.]*(.+)/)
  if (trackNumberMatch) {
    return {
      trackNumber: parseInt(trackNumberMatch[1], 10),
      title: trackNumberMatch[2].trim()
    }
  }
  
  // Попытка найти паттерн "Artist - Title"
  const artistTitleMatch = baseName.match(/^(.+?)\s*-\s*(.+)$/)
  if (artistTitleMatch) {
    return {
      artist: artistTitleMatch[1].trim(),
      title: artistTitleMatch[2].trim()
    }
  }
  
  // Если паттерны не найдены, используем весь базовый файл как название
  return {
    title: baseName.trim()
  }
}

// Функция для валидации аудио файла
export function validateAudioFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 500 * 1024 * 1024 // 500MB
  const supportedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/m4a', 'audio/aac', 'audio/ogg']
  const supportedExtensions = ['.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg']
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `Файл слишком большой. Максимальный размер: 500MB`
    }
  }
  
  const isValidType = supportedTypes.includes(file.type) || 
                     supportedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  
  if (!isValidType) {
    return {
      isValid: false,
      error: `Неподдерживаемый формат файла. Поддерживаются: ${supportedExtensions.join(', ')}`
    }
  }
  
  return { isValid: true }
}

// Функция для валидации изображения
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024 // 50MB
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `Изображение слишком большое. Максимальный размер: 50MB`
    }
  }
  
  if (!supportedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Неподдерживаемый формат изображения. Поддерживаются: JPG, PNG, WebP, GIF`
    }
  }
  
  return { isValid: true }
}

// Функция для получения информации о качестве аудио
export function getAudioQuality(file: File): 'lossy' | 'lossless' | 'hi-res' | 'unknown' {
  const losslessFormats = ['wav', 'flac', 'alac']
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  if (!extension) return 'unknown'
  
  if (losslessFormats.includes(extension)) {
    // Для определения hi-res качества нужно анализировать sample rate и bit depth
    // Это требует полного парсинга файла
    return 'lossless'
  }
  
  return 'lossy'
}

// Утилита для сортировки треков по номеру
export function sortTracksByNumber(files: File[]): File[] {
  return files.sort((a, b) => {
    const aInfo = extractInfoFromFileName(a.name)
    const bInfo = extractInfoFromFileName(b.name)
    
    const aTrackNumber = aInfo.trackNumber || 999
    const bTrackNumber = bInfo.trackNumber || 999
    
    return aTrackNumber - bTrackNumber
  })
} 