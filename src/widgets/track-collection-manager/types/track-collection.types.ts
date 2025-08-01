// Типы для Track Collection Manager Widget

export interface TrackFileItem {
  id: string
  file: File
  preview?: string
  progress?: number
  error?: string
  uploading?: boolean
  metadata?: {
    duration?: number
    title?: string
    artist?: string
    album?: string
    bitrate?: number
    format?: string
  }
}

export interface TrackUploadProps {
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSizeMB?: number
  label?: string
  hint?: string
  error?: string
  value?: TrackFileItem[]
  onFilesChange?: (files: TrackFileItem[]) => void
  onUploadProgress?: (fileId: string, progress: number) => void
  onUploadComplete?: (fileId: string, url: string) => void
  onUploadError?: (fileId: string, error: string) => void
  disabled?: boolean
  className?: string
}

export interface TrackValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
}

export interface TrackCollectionState {
  files: TrackFileItem[]
  isDragging: boolean
  isUploading: boolean
  uploadProgress: number
  validationErrors: Record<string, string>
}

export interface TrackRequirements {
  maxSizeMB: number
  allowedFormats: string[]
  maxDurationMinutes?: number
  minBitrate?: number
  requireMetadata?: boolean
}

export interface TrackMetadata {
  duration: number
  title?: string
  artist?: string
  album?: string
  bitrate: number
  format: string
  sampleRate?: number
  channels?: number
}