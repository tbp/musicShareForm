// Track Collection Manager Widget
// Загрузка и управление аудио файлами

export { EnhancedFileUpload as TrackCollectionManager } from './components/EnhancedFileUpload'
export { useFileUpload } from './hooks/useFileUpload'
export type { 
  TrackFileItem, 
  TrackUploadProps, 
  TrackValidationResult, 
  TrackCollectionState, 
  TrackRequirements, 
  TrackMetadata 
} from './types/track-collection.types'