import { useState, useCallback, useMemo } from 'react'
import type { FileItem, ArtworkState, ArtworkRequirements } from '../types/artwork.types'
import { createFileItem, validateArtworkFile, DEFAULT_ARTWORK_REQUIREMENTS } from '../utils/artworkValidation'

export function useArtworkUpload(
  initialFiles: FileItem[] = [],
  requirements: ArtworkRequirements = DEFAULT_ARTWORK_REQUIREMENTS
) {
  const [files, setFiles] = useState<FileItem[]>(initialFiles)
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Текущий файл (для single file upload)
  const currentFile = files[0] || null

  // Состояние виджета
  const state: ArtworkState = useMemo(() => ({
    files,
    isDragging,
    validationError,
    isProcessing
  }), [files, isDragging, validationError, isProcessing])

  // Обработка файлов
  const handleFiles = useCallback(async (fileList: FileList) => {
    const file = fileList[0] // Берем только первый файл
    if (!file) return

    setValidationError(null)
    setIsProcessing(true)

    try {
      // Сначала базовая валидация без размеров
      const basicValidation = validateArtworkFile(file, undefined, requirements)
      if (!basicValidation.isValid) {
        setValidationError(basicValidation.error || 'Ошибка валидации файла')
        return
      }

      // Создание FileItem с полной валидацией
      const fileItem = await createFileItem(file, requirements)
      setFiles([fileItem])
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при обработке изображения'
      setValidationError(errorMessage)
      console.error('Ошибка при обработке изображения:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [requirements])

  // Удаление файлов
  const removeFiles = useCallback(() => {
    setFiles([])
    setValidationError(null)
  }, [])

  // Удаление конкретного файла по ID
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId))
    setValidationError(null)
  }, [])

  // Очистка ошибок валидации
  const clearValidationError = useCallback(() => {
    setValidationError(null)
  }, [])

  // Drag & Drop handlers
  const dragHandlers = useMemo(() => ({
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true)
      }
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      // Проверяем что мы действительно покинули область
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX
      const y = e.clientY
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        setIsDragging(false)
      }
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      
      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        handleFiles(files)
      }
    }
  }), [handleFiles])

  // Обновление файлов извне
  const updateFiles = useCallback((newFiles: FileItem[]) => {
    setFiles(newFiles)
    setValidationError(null)
  }, [])

  return {
    // Состояние
    files,
    currentFile,
    isDragging,
    validationError,
    isProcessing,
    state,
    requirements,

    // Действия
    handleFiles,
    removeFiles,
    removeFile,
    updateFiles,
    clearValidationError,

    // Drag & Drop
    dragHandlers,

    // Вычисляемые значения
    hasFiles: files.length > 0,
    isEmpty: files.length === 0
  }
}