'use client'

import React, { useState, useCallback } from 'react'
import { Upload, X, File, Image as ImageIcon, Music, FileText, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EnhancedButton } from './enhanced-button'

export interface FileItem {
  id: string
  file: File
  preview?: string
  progress?: number
  error?: string
  uploading?: boolean
}

export interface EnhancedFileUploadProps {
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSizeMB?: number
  label?: string
  hint?: string
  error?: string
  value?: FileItem[]
  onFilesChange?: (files: FileItem[]) => void
  onUploadProgress?: (fileId: string, progress: number) => void
  onUploadComplete?: (fileId: string, url: string) => void
  onUploadError?: (fileId: string, error: string) => void
  disabled?: boolean
  className?: string
}

// Helper function to format file size
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Get file icon based on type
const getFileIcon = (file: File) => {
  const type = file.type
  if (type.startsWith('image/')) return <ImageIcon className="size-4" />
  if (type.startsWith('audio/')) return <Music className="size-4" />
  if (type.startsWith('video/')) return <File className="size-4" />
  if (type.includes('pdf')) return <FileText className="size-4" />
  return <File className="size-4" />
}

const EnhancedFileUpload = React.forwardRef<
  HTMLInputElement,
  EnhancedFileUploadProps
>(({
  accept = '*/*',
  multiple = false,
  maxFiles = 10,
  maxSizeMB = 10,
  label,
  hint,
  error,
  value = [],
  onFilesChange,
  onUploadProgress: _onUploadProgress,
  onUploadComplete: _onUploadComplete,
  onUploadError,
  disabled = false,
  className,
  ...props
}, ref) => {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Merge refs
  React.useImperativeHandle(ref, () => inputRef.current!)

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    const fileSizeMB = file.size / 1024 / 1024
    if (fileSizeMB > maxSizeMB) {
      return `Файл "${file.name}" превышает максимальный размер ${maxSizeMB}МБ`
    }

    // Check max files
    if (!multiple && value.length >= 1) {
      return 'Можно загрузить только один файл'
    }

    if (multiple && value.length >= maxFiles) {
      return `Максимальное количество файлов: ${maxFiles}`
    }

    return null
  }, [maxSizeMB, maxFiles, multiple, value.length])

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const newFiles: FileItem[] = []
    const errors: string[] = []

    fileArray.forEach((file) => {
      const validationError = validateFile(file)
      if (validationError) {
        errors.push(validationError)
        return
      }

      const fileItem: FileItem = {
        id: crypto.randomUUID(),
        file,
        progress: 0,
        uploading: false,
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        fileItem.preview = URL.createObjectURL(file)
      }

      newFiles.push(fileItem)
    })

    if (errors.length > 0) {
      onUploadError?.(newFiles[0]?.id || '', errors.join(', '))
      return
    }

    const updatedFiles = multiple ? [...value, ...newFiles] : newFiles
    onFilesChange?.(updatedFiles)
  }, [validateFile, multiple, value, onFilesChange, onUploadError])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFiles(files)
    }
    // Reset input
    e.target.value = ''
  }, [processFiles])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processFiles(files)
    }
  }, [processFiles])

  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = value.filter(f => f.id !== fileId)
    onFilesChange?.(updatedFiles)

    // Revoke object URL to prevent memory leaks
    const fileToRemove = value.find(f => f.id === fileId)
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
  }, [value, onFilesChange])

  const clearAllFiles = useCallback(() => {
    // Revoke all object URLs
    value.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    onFilesChange?.([])
  }, [value, onFilesChange])

  const openFileDialog = useCallback(() => {
    inputRef.current?.click()
  }, [])

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}

      {/* File list or drop area */}
      {value.length > 0 ? (
        <div className="space-y-3">
          {/* File list header */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">
              Файлы ({value.length})
            </h4>
            <div className="flex gap-2">
              <EnhancedButton
                variant="outline"
                size="sm"
                onClick={openFileDialog}
                disabled={disabled}
                leftIcon={<Upload className="size-3.5" />}
              >
                Добавить
              </EnhancedButton>
              <EnhancedButton
                variant="outline"
                size="sm"
                onClick={clearAllFiles}
                disabled={disabled}
                leftIcon={<Trash2 className="size-3.5" />}
              >
                Очистить
              </EnhancedButton>
            </div>
          </div>

          {/* File list */}
          <div className="space-y-2">
            {value.map((fileItem) => (
              <div
                key={fileItem.id}
                className={cn(
                  'flex items-center gap-3 p-3 bg-background border border-border rounded-lg',
                  'transition-all duration-200',
                  fileItem.uploading && 'opacity-60'
                )}
              >
                {/* File icon/preview */}
                <div className="flex-shrink-0">
                  {fileItem.preview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={fileItem.preview}
                      alt={fileItem.file.name}
                      className="size-10 object-cover rounded border"
                    />
                  ) : (
                    <div className="size-10 bg-muted rounded border flex items-center justify-center">
                      {getFileIcon(fileItem.file)}
                    </div>
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {fileItem.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(fileItem.file.size)}
                  </p>
                  
                  {/* Progress bar */}
                  {fileItem.uploading && typeof fileItem.progress === 'number' && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${fileItem.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {fileItem.progress}%
                      </span>
                    </div>
                  )}

                  {/* Error message */}
                  {fileItem.error && (
                    <p className="text-xs text-destructive mt-1">
                      {fileItem.error}
                    </p>
                  )}
                </div>

                {/* Remove button */}
                <EnhancedButton
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(fileItem.id)}
                  disabled={disabled}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Удалить файл"
                >
                  <X className="size-4" />
                </EnhancedButton>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Drop area */
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            'file-upload-area relative flex flex-col items-center justify-center',
            'min-h-32 p-6 cursor-pointer',
            isDragging && 'border-primary bg-primary/5',
            disabled && 'cursor-not-allowed opacity-50',
            error && 'border-destructive'
          )}
          onClick={!disabled ? openFileDialog : undefined}
        >
          <div className="text-center">
            <div className={cn(
              'mx-auto flex size-12 items-center justify-center rounded-full',
              'bg-muted mb-4 transition-colors duration-200',
              isDragging && 'bg-primary/10'
            )}>
              <Upload className={cn(
                'size-6 transition-colors duration-200',
                isDragging ? 'text-primary' : 'text-muted-foreground'
              )} />
            </div>
            
            <h3 className="mb-2 text-sm font-medium text-foreground">
              {isDragging ? 'Отпустите файлы здесь' : 'Перетащите файлы сюда'}
            </h3>
            
            <p className="text-xs text-muted-foreground mb-4">
              {multiple ? `До ${maxFiles} файлов` : 'Один файл'} • 
              До {maxSizeMB}МБ {accept !== '*/*' && `• ${accept}`}
            </p>

            <EnhancedButton
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation()
                openFileDialog()
              }}
              leftIcon={<Upload className="size-3.5" />}
            >
              Выбрать файлы
            </EnhancedButton>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        disabled={disabled}
        className="sr-only"
        {...props}
      />

      {/* Helper text / Error message */}
      {(hint || error) && (
        <div className="mt-2 text-xs">
          {error ? (
            <span className="text-destructive animate-fade-in">
              {error}
            </span>
          ) : hint ? (
            <span className="text-muted-foreground">
              {hint}
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
})

EnhancedFileUpload.displayName = 'EnhancedFileUpload'

export { EnhancedFileUpload } 