import { useState, useCallback, useMemo } from 'react'
import type { TrackFileItem, TrackCollectionState, TrackRequirements } from '../types/track-collection.types'
import { createTrackFileItem, validateTrackFile, DEFAULT_TRACK_REQUIREMENTS } from '../utils/trackValidation'

export function useFileUpload(
  initialFiles: TrackFileItem[] = [],
  requirements: TrackRequirements = DEFAULT_TRACK_REQUIREMENTS,
  options: {
    multiple?: boolean
    maxFiles?: number
  } = {}
) {
  const { multiple = true, maxFiles = 10 } = options
  
  const [files, setFiles] = useState<TrackFileItem[]>(initialFiles)
  const [isDragging, setIsDragging] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Вычисляемые значения
  const uploadProgress = useMemo(() => {
    if (files.length === 0) return 0
    const totalProgress = files.reduce((sum, file) => sum + (file.progress || 0), 0)
    return Math.round(totalProgress / files.length)
  }, [files])

  const isUploading = useMemo(() => {
    return files.some(file => file.uploading)
  }, [files])

  // Состояние виджета
  const state: TrackCollectionState = useMemo(() => ({
    files,
    isDragging,
    isUploading,
    uploadProgress,
    validationErrors
  }), [files, isDragging, isUploading, uploadProgress, validationErrors])

  // Обработка файлов
  const handleFiles = useCallback(async (fileList: FileList) => {
    const filesToProcess = Array.from(fileList)
    
    // Проверка лимита файлов
    const currentCount = files.length
    const remainingSlots = maxFiles - currentCount
    
    if (remainingSlots <= 0) {
      setValidationErrors(prev => ({
        ...prev,
        general: `Максимальное количество файлов: ${maxFiles}`
      }))
      return
    }

    const filesToAdd = multiple 
      ? filesToProcess.slice(0, remainingSlots)
      : [filesToProcess[0]]

    // Очистка ошибок
    setValidationErrors({})

    const newFiles: TrackFileItem[] = []
    const errors: Record<string, string> = {}

    for (const file of filesToAdd) {
      try {
        // Базовая валидация
        const validation = validateTrackFile(file, requirements)
        if (!validation.isValid) {
          errors[file.name] = validation.error || 'Ошибка валидации файла'
          continue
        }

        // Создание TrackFileItem
        const trackItem = await createTrackFileItem(file, requirements)
        newFiles.push(trackItem)
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ошибка при обработке файла'
        errors[file.name] = errorMessage
        console.error(`Ошибка при обработке файла ${file.name}:`, error)
      }
    }

    // Обновление состояния
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
    }

    if (newFiles.length > 0) {
      setFiles(prev => multiple ? [...prev, ...newFiles] : newFiles)
    }
  }, [files.length, maxFiles, multiple, requirements])

  // Удаление файла по ID
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId))
    setValidationErrors(prev => {
      const { [fileId]: removed, ...rest } = prev
      return rest
    })
  }, [])

  // Удаление всех файлов
  const removeAllFiles = useCallback(() => {
    setFiles([])
    setValidationErrors({})
  }, [])

  // Обновление прогресса загрузки
  const updateFileProgress = useCallback((fileId: string, progress: number) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, progress, uploading: progress < 100 }
        : file
    ))
  }, [])

  // Обновление статуса загрузки
  const updateFileStatus = useCallback((fileId: string, updates: Partial<TrackFileItem>) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, ...updates }
        : file
    ))
  }, [])

  // Очистка ошибок валидации
  const clearValidationErrors = useCallback(() => {
    setValidationErrors({})
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
  const updateFiles = useCallback((newFiles: TrackFileItem[]) => {
    setFiles(newFiles)
    setValidationErrors({})
  }, [])

  return {
    // Состояние
    files,
    isDragging,
    isUploading,
    uploadProgress,
    validationErrors,
    state,
    requirements,

    // Действия
    handleFiles,
    removeFile,
    removeAllFiles,
    updateFiles,
    updateFileProgress,
    updateFileStatus,
    clearValidationErrors,

    // Drag & Drop
    dragHandlers,

    // Вычисляемые значения
    hasFiles: files.length > 0,
    isEmpty: files.length === 0,
    canAddMore: files.length < maxFiles,
    remainingSlots: Math.max(0, maxFiles - files.length)
  }
}