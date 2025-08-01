// Типы для Artwork Manager Widget

export interface FileItem {
  id: string
  file: File
  preview?: string
  dimensions?: {
    width: number
    height: number
  }
}

export interface CoverArtUploaderProps {
  value: FileItem[]
  onFilesChange: (files: FileItem[]) => void
  error?: string
  hint?: string
  className?: string
  maxSizeMB?: number
}

export interface ImageDimensions {
  width: number
  height: number
}

export interface ArtworkValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
}

export interface ArtworkState {
  files: FileItem[]
  isDragging: boolean
  validationError: string | null
  isProcessing: boolean
}

export interface ArtworkRequirements {
  minResolution: number
  maxSizeMB: number
  allowedFormats: string[]
  aspectRatio?: number
}