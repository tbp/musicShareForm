'use client'

import React from 'react'
import { Upload, X, Music, File, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TrackUploadProps } from '../types/track-collection.types'
import { getTrackDisplayInfo } from '../utils/trackValidation'

const EnhancedFileUpload = React.forwardRef<HTMLDivElement, TrackUploadProps>(
  ({ 
    accept = "audio/*",
    multiple = true,
    maxFiles = 10,
    maxSizeMB = 100,
    label = "Загрузка треков",
    hint,
    error,
    value = [],
    onFilesChange,
    onUploadProgress,
    onUploadComplete,
    onUploadError,
    disabled = false,
    className,
    ...props 
  }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false)
    const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({})
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const dragCounterRef = React.useRef(0)

    // Валидация файла
    const validateFile = (file: File): string | null => {
      if (!file.type.startsWith('audio/') && !accept.includes('*')) {
        return 'Можно загружать только аудио файлы'
      }

      const fileSizeMB = file.size / 1024 / 1024
      if (fileSizeMB > maxSizeMB) {
        return `Размер файла не должен превышать ${maxSizeMB}МБ`
      }

      return null
    }

    // Обработка файлов
    const handleFiles = React.useCallback(async (files: FileList) => {
      const filesToProcess = Array.from(files)
      const currentCount = value.length
      const remainingSlots = maxFiles - currentCount

      if (remainingSlots <= 0) {
        setValidationErrors(prev => ({
          ...prev,
          general: `Максимальное количество файлов: ${maxFiles}`
        }))
        return
      }

      const filesToAdd = multiple ? filesToProcess.slice(0, remainingSlots) : [filesToProcess[0]]
      const newFiles = []
      const errors: Record<string, string> = {}

      for (const file of filesToAdd) {
        const validationError = validateFile(file)
        if (validationError) {
          errors[file.name] = validationError
          continue
        }

        newFiles.push({
          id: crypto.randomUUID(),
          file,
          progress: 0,
          uploading: false
        })
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors)
      }

      if (newFiles.length > 0) {
        const updatedFiles = multiple ? [...value, ...newFiles] : newFiles
        onFilesChange?.(updatedFiles)
      }
    }, [value, maxFiles, multiple, maxSizeMB, accept, onFilesChange])

    // Drag & Drop handlers
    const handleDragEnter = React.useCallback((e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounterRef.current++
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true)
      }
    }, [])

    const handleDragLeave = React.useCallback((e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounterRef.current--
      if (dragCounterRef.current === 0) {
        setIsDragging(false)
      }
    }, [])

    const handleDragOver = React.useCallback((e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }, [])

    const handleDrop = React.useCallback((e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      dragCounterRef.current = 0

      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        handleFiles(files)
      }
    }, [handleFiles])

    // File input handler
    const handleFileInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFiles(files)
      }
      // Очистка input для возможности повторной загрузки того же файла
      e.target.value = ''
    }, [handleFiles])

    // Открытие диалога выбора файла
    const openFileDialog = React.useCallback(() => {
      if (!disabled) {
        fileInputRef.current?.click()
      }
    }, [disabled])

    // Удаление файла
    const removeFile = React.useCallback((fileId: string) => {
      const updatedFiles = value.filter(file => file.id !== fileId)
      onFilesChange?.(updatedFiles)
      setValidationErrors(prev => {
        const { [fileId]: _, ...rest } = prev
        return rest
      })
    }, [value, onFilesChange])

    const hasFiles = value.length > 0
    const canAddMore = value.length < maxFiles

    return (
      <div ref={ref} className={cn('w-full space-y-4', className)} {...props}>
        {/* Заголовок */}
        {label && (
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">{label}</h3>
            <span className="text-xs text-muted-foreground">
              {value.length}/{maxFiles} файлов
            </span>
          </div>
        )}

        {/* Область загрузки */}
        {(!hasFiles || canAddMore) && (
          <div
            className={cn(
              'relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200',
              'bg-background hover:bg-accent/50 cursor-pointer',
              isDragging 
                ? 'border-primary bg-primary/5' 
                : error 
                ? 'border-destructive' 
                : 'border-border hover:border-primary/50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <div className={cn(
              'mb-4 p-3 rounded-full transition-colors duration-200 inline-flex',
              isDragging ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>
              <Upload className="w-6 h-6" />
            </div>
            
            <h4 className="text-lg font-semibold text-foreground mb-2">
              {isDragging ? 'Отпустите файлы' : hasFiles ? 'Добавить еще треки' : 'Загрузите треки'}
            </h4>
            
            <p className="text-sm text-muted-foreground mb-4">
              Перетащите аудио файлы сюда или нажмите для выбора
            </p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Upload className="w-4 h-4" />
              Выбрать файлы
            </div>
            
            <p className="text-xs text-muted-foreground mt-4">
              MP3, WAV, FLAC, AAC • До {maxSizeMB}МБ каждый
            </p>

            {/* Скрытый input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileInputChange}
              disabled={disabled}
              className="sr-only"
            />
          </div>
        )}

        {/* Список файлов */}
        {hasFiles && (
          <div className="space-y-3">
            {value.map((fileItem) => {
              const displayInfo = getTrackDisplayInfo(fileItem)
              
              return (
                <div
                  key={fileItem.id}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border"
                >
                  {/* Иконка файла */}
                  <div className="flex-shrink-0 p-2 bg-primary/10 rounded-md">
                    <Music className="w-4 h-4 text-primary" />
                  </div>
                  
                  {/* Информация о файле */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {displayInfo.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{displayInfo.format}</span>
                      <span>•</span>
                      <span>{displayInfo.size}</span>
                      {displayInfo.duration && (
                        <>
                          <span>•</span>
                          <span>{displayInfo.duration}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Прогресс загрузки */}
                  {fileItem.uploading && (
                    <div className="flex-shrink-0 w-16">
                      <div className="text-xs text-muted-foreground text-center mb-1">
                        {fileItem.progress}%
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${fileItem.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Кнопка удаления */}
                  <button
                    onClick={() => removeFile(fileItem.id)}
                    disabled={disabled}
                    className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50"
                    aria-label="Удалить файл"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Ошибки */}
        {(error || Object.keys(validationErrors).length > 0) && (
          <div className="space-y-2">
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium text-destructive">
                    {error}
                  </p>
                </div>
              </div>
            )}
            
            {Object.entries(validationErrors).map(([key, errorMessage]) => (
              <div key={key} className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">
                      {key !== 'general' && <span className="font-mono">{key}: </span>}
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Подсказка */}
        {hint && !error && Object.keys(validationErrors).length === 0 && (
          <p className="text-sm text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

EnhancedFileUpload.displayName = 'EnhancedFileUpload'

export { EnhancedFileUpload }