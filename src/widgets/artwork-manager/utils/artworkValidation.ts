import type { FileItem, ImageDimensions, ArtworkValidationResult, ArtworkRequirements } from '../types/artwork.types'

// Стандартные требования для обложек релизов
export const DEFAULT_ARTWORK_REQUIREMENTS: ArtworkRequirements = {
  minResolution: 3000,
  maxSizeMB: 10,
  allowedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  aspectRatio: 1 // Квадратные изображения
}

// Создание превью и получение размеров изображения
export const createPreviewWithDimensions = (file: File): Promise<{preview: string, dimensions: ImageDimensions}> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Файл не является изображением'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        resolve({
          preview: e.target?.result as string,
          dimensions: {
            width: img.width,
            height: img.height
          }
        })
      }
      img.onerror = () => {
        reject(new Error('Ошибка при загрузке изображения'))
      }
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      reject(new Error('Ошибка при чтении файла'))
    }
    reader.readAsDataURL(file)
  })
}

// Валидация файла изображения
export const validateArtworkFile = (
  file: File, 
  dimensions?: ImageDimensions,
  requirements: ArtworkRequirements = DEFAULT_ARTWORK_REQUIREMENTS
): ArtworkValidationResult => {
  const warnings: string[] = []

  // Проверка типа файла
  if (!requirements.allowedFormats.includes(file.type)) {
    return {
      isValid: false,
      error: `Неподдерживаемый формат. Разрешены: ${requirements.allowedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}`
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

  // Проверка разрешения (только если размеры определены)
  if (dimensions) {
    if (dimensions.width < requirements.minResolution || dimensions.height < requirements.minResolution) {
      return {
        isValid: false,
        error: `Минимальное разрешение: ${requirements.minResolution}×${requirements.minResolution}px (загружено: ${dimensions.width}×${dimensions.height}px)`
      }
    }

    // Проверка соотношения сторон (если указано)
    if (requirements.aspectRatio) {
      const aspectRatio = dimensions.width / dimensions.height
      const tolerance = 0.02 // 2% допуск
      if (Math.abs(aspectRatio - requirements.aspectRatio) > tolerance) {
        const expectedRatio = requirements.aspectRatio === 1 ? 'квадратное (1:1)' : `${requirements.aspectRatio}:1`
        warnings.push(`Рекомендуемое соотношение сторон: ${expectedRatio}`)
      }
    }

    // Рекомендации по качеству
    const recommendedResolution = 4000
    if (dimensions.width >= recommendedResolution && dimensions.height >= recommendedResolution) {
      warnings.push('Отличное качество для всех платформ')
    } else if (dimensions.width >= 3000 && dimensions.height >= 3000) {
      warnings.push('Хорошее качество для большинства платформ')
    }
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

// Создание FileItem из File
export const createFileItem = async (file: File, requirements?: ArtworkRequirements): Promise<FileItem> => {
  const { preview, dimensions } = await createPreviewWithDimensions(file)
  
  // Валидация
  const validation = validateArtworkFile(file, dimensions, requirements)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }

  return {
    id: crypto.randomUUID(),
    file,
    preview,
    dimensions
  }
}

// Получение информации о файле для отображения
export const getFileDisplayInfo = (fileItem: FileItem) => {
  const sizeMB = (fileItem.file.size / 1024 / 1024).toFixed(1)
  const dimensions = fileItem.dimensions 
    ? `${fileItem.dimensions.width}×${fileItem.dimensions.height}`
    : 'Неизвестно'
  
  return {
    size: `${sizeMB}МБ`,
    dimensions,
    name: fileItem.file.name,
    type: fileItem.file.type.split('/')[1].toUpperCase()
  }
}

// Проверка является ли файл изображением
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/')
}

// Конвертация в определенный формат (если нужно)
export const convertToFormat = (canvas: HTMLCanvasElement, format: 'jpeg' | 'png' | 'webp', quality = 0.9): string => {
  const mimeType = `image/${format}`
  return canvas.toDataURL(mimeType, quality)
}