'use client'

import * as React from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CoverArtUploaderProps } from '../types/artwork.types'
import { getFileDisplayInfo } from '../utils/artworkValidation'

const CoverArtUploader = React.forwardRef<HTMLDivElement, CoverArtUploaderProps>(
  ({ value, onFilesChange, error, hint, className, maxSizeMB = 10 }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false)
    const [validationError, setValidationError] = React.useState<string | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const dragCounterRef = React.useRef(0)

    const currentFile = value[0]

    // Создание превью и получение размеров
    const createPreviewWithDimensions = React.useCallback((file: File): Promise<{preview: string, dimensions: {width: number, height: number}}> => {
      return new Promise((resolve) => {
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
          img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
      })
    }, [])

    // Валидация файла
    const validateFile = React.useCallback((file: File, dimensions?: {width: number, height: number}): string | null => {
      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        return 'Можно загружать только изображения'
      }

      // Проверка размера файла
      const fileSizeMB = file.size / 1024 / 1024
      if (fileSizeMB > maxSizeMB) {
        return `Размер файла не должен превышать ${maxSizeMB}МБ`
      }

      // Проверка разрешения (только если размеры определены)
      if (dimensions) {
        const minResolution = 3000
        if (dimensions.width < minResolution || dimensions.height < minResolution) {
          return `Минимальное разрешение: ${minResolution}×${minResolution}px (загружено: ${dimensions.width}×${dimensions.height}px)`
        }
      }

      return null
    }, [maxSizeMB])

    // Обработка файлов
    const handleFiles = React.useCallback(async (files: FileList) => {
      const file = files[0] // Берем только первый файл
      if (!file) return

      setValidationError(null)

      // Сначала базовая валидация без размеров
      const basicValidationError = validateFile(file)
      if (basicValidationError) {
        setValidationError(basicValidationError)
        return
      }

      try {
        const { preview, dimensions } = await createPreviewWithDimensions(file)
        
        // Валидация с размерами
        const fullValidationError = validateFile(file, dimensions)
        if (fullValidationError) {
          setValidationError(fullValidationError)
          return
        }

        const fileItem = {
          id: crypto.randomUUID(),
          file,
          preview,
          dimensions
        }

        onFilesChange([fileItem])
      } catch (error) {
        setValidationError('Ошибка при обработке изображения')
        console.error('Ошибка при обработке изображения:', error)
      }
    }, [validateFile, createPreviewWithDimensions, onFilesChange])

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
      fileInputRef.current?.click()
    }, [])

    // Удаление файла
    const removeFile = React.useCallback(() => {
      setValidationError(null)
      onFilesChange([])
    }, [onFilesChange])

    return (
      <div ref={ref} className={cn('w-full', className)}>
        <div
          className={cn(
            'relative w-full rounded-lg border-2 border-dashed transition-all duration-200',
            'bg-background hover:bg-accent/50',
            isDragging 
              ? 'border-primary bg-primary/5' 
              : error 
              ? 'border-destructive' 
              : 'border-border hover:border-primary/50',
            'cursor-pointer overflow-hidden',
            // Убираем aspect-square, делаем flex колонку с min-height
            currentFile ? 'aspect-square' : 'min-h-[500px] flex flex-col'
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          {currentFile ? (
            // Показ превью обложки с информацией
            <div className="relative w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentFile.preview}
                alt="Обложка релиза"
                className="w-full h-full object-cover rounded-lg"
              />
              
              {/* Кнопка удаления */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile()
                }}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm"
                aria-label="Удалить обложку"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Информация о файле */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent text-white p-3 rounded-b-lg">
                <div className="flex items-center text-sm">
                  <span className="font-mono tabular-nums">
                    {(currentFile.file.size / 1024 / 1024).toFixed(1)}МБ
                  </span>
                  {currentFile.dimensions && (
                    <>
                      <span className="opacity-50 mx-2">•</span>
                      <span className="font-mono tabular-nums">
                        {currentFile.dimensions.width}×{currentFile.dimensions.height}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Область для загрузки
            <>
              {/* Основной контент по центру */}
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className={cn(
                  'mb-4 p-4 rounded-full transition-colors duration-200',
                  isDragging ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  <ImageIcon className="w-8 h-8" />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {isDragging ? 'Отпустите файл' : 'Загрузите обложку'}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4">
                  Перетащите изображение сюда или нажмите для выбора
                </p>
                
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  <Upload className="w-4 h-4" />
                  Выбрать файл
                </div>
                
                <p className="text-xs text-muted-foreground mt-4">
                  JPG, PNG • Высокое качество
                </p>
              </div>
            </>
          )}

          {/* Скрытый input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="sr-only"
          />
        </div>

        {/* Предупреждение - всегда показываем под обложкой */}
        <div className="mt-4 p-4 border border-border bg-muted/20 rounded-lg">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Загружая обложку, вы подтверждаете наличие у вас прав на коммерческое использование. Многие AI-сервисы при генерации не передают такие права.
          </p>
        </div>

        {/* Ошибка */}
        {(error || validationError) && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 mt-0.5">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error || validationError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Подсказка */}
        {hint && !error && !validationError && (
          <p className="text-sm text-muted-foreground mt-3">
            {hint}
          </p>
        )}
      </div>
    )
  }
)
CoverArtUploader.displayName = 'CoverArtUploader'

export { CoverArtUploader }