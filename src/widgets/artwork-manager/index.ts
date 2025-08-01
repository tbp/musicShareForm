// Artwork Manager Widget
// Управление визуальными материалами релиза

export { CoverArtUploader as ArtworkManager } from './components/CoverArtUploader'
export { useArtworkUpload } from './hooks/useArtworkUpload'
export type { 
  FileItem, 
  CoverArtUploaderProps, 
  ImageDimensions, 
  ArtworkValidationResult, 
  ArtworkState, 
  ArtworkRequirements 
} from './types/artwork.types'