'use client'

import { useState, useCallback } from 'react'
import {
  extractMetadataFromFile,
  extractInfoFromFileName,
  validateAudioFile,
  validateImageFile,
  sortTracksByNumber,
  getAudioQuality,
  type ExtractedMetadata
} from '@/lib/metadata-extractor'
import { TrackFormData } from '@/types/ddex-release'

export interface FileWithMetadata {
  file: File
  id: string
  type: 'audio' | 'image'
  metadata?: ExtractedMetadata
  trackMetadata?: TrackFormData  // DDEX track metadata
  quality?: 'lossy' | 'lossless' | 'hi-res' | 'unknown'
  isProcessing: boolean
  error?: string
}

export function useFileUpload() {
  const [files, setFiles] = useState<FileWithMetadata[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const processFile = useCallback(async (file: File): Promise<FileWithMetadata> => {
    const id = Math.random().toString(36).substr(2, 9)
    const isAudio = file.type.startsWith('audio/') || 
                   ['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg'].some(ext => 
                     file.name.toLowerCase().endsWith(`.${ext}`))
    const isImage = file.type.startsWith('image/')

    if (!isAudio && !isImage) {
      return {
        file,
        id,
        type: 'audio',
        isProcessing: false,
        error: 'Неподдерживаемый тип файла'
      }
    }

    const fileWithMetadata: FileWithMetadata = {
      file,
      id,
      type: isAudio ? 'audio' : 'image',
      isProcessing: true
    }

    // Валидация
    if (isAudio) {
      const validation = validateAudioFile(file)
      if (!validation.isValid) {
        return {
          ...fileWithMetadata,
          isProcessing: false,
          error: validation.error
        }
      }
    } else if (isImage) {
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        return {
          ...fileWithMetadata,
          isProcessing: false,
          error: validation.error
        }
      }
    }

    try {
      if (isAudio) {
        // Извлекаем метаданные из файла и имени
        const [extractedMetadata, fileNameInfo] = await Promise.all([
          extractMetadataFromFile(file),
          Promise.resolve(extractInfoFromFileName(file.name))
        ])

        const combinedMetadata = {
          ...fileNameInfo,
          ...extractedMetadata
        }

                    // Create DDEX-compliant track metadata
            const trackMetadata: TrackFormData = {
              title: combinedMetadata.title || file.name.replace(/\.[^/.]+$/, ''),
              trackNumber: combinedMetadata.trackNumber || 1,
              durationSeconds: combinedMetadata.duration,
              isrc: '', // Will be auto-generated if empty
              bpm: combinedMetadata.bpm,
              sampleRate: undefined, // Will be extracted from file
              bitDepth: undefined,   // Will be extracted from file
              channels: undefined,   // Will be extracted from file
              language: 'English',   // Default language
              contributors: []       // Empty by default
            }

            return {
              ...fileWithMetadata,
              metadata: combinedMetadata,
              trackMetadata,
              quality: getAudioQuality(file),
              isProcessing: false
            }
      } else {
        // Для изображений метаданные пока не извлекаем
        return {
          ...fileWithMetadata,
          isProcessing: false
        }
      }
    } catch (err) {
      console.error('Error processing file:', err)
      return {
        ...fileWithMetadata,
        isProcessing: false,
        error: 'Failed to process file'
      }
    }
  }, [])

  const addFiles = useCallback(async (newFiles: File[]) => {
    setIsProcessing(true)
    
    try {
      const processedFiles = await Promise.all(
        newFiles.map(file => processFile(file))
      )

      setFiles(prevFiles => {
        const updated = [...prevFiles, ...processedFiles]
        
        // Сортируем аудио файлы по номеру трека
        const audioFiles = updated.filter(f => f.type === 'audio').map(f => f.file)
        const sortedAudioFiles = sortTracksByNumber(audioFiles)
        
        // Пересобираем массив с правильным порядком
        const imageFiles = updated.filter(f => f.type === 'image')
        const audioFilesWithMetadata = updated.filter(f => f.type === 'audio')
        
        const reorderedAudioFiles = sortedAudioFiles.map(sortedFile => 
          audioFilesWithMetadata.find(f => f.file.name === sortedFile.name)!
        )
        
        return [...reorderedAudioFiles, ...imageFiles]
      })
    } finally {
      setIsProcessing(false)
    }
  }, [processFile])

  const removeFile = useCallback((id: string) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== id))
  }, [])

    const updateFileMetadata = useCallback((id: string, metadata: Partial<ExtractedMetadata>) => {
    setFiles(prevFiles =>
      prevFiles.map(f =>
        f.id === id
          ? { ...f, metadata: { ...f.metadata, ...metadata } }
          : f
      )
    )
  }, [])

  const updateTrackMetadata = useCallback((id: string, trackMetadata: TrackFormData) => {
    setFiles(prevFiles =>
      prevFiles.map(f =>
        f.id === id
          ? { ...f, trackMetadata }
          : f
      )
    )
  }, [])

  const clearFiles = useCallback(() => {
    setFiles([])
  }, [])

  const getAudioFiles = useCallback(() => {
    return files.filter(f => f.type === 'audio')
  }, [files])

  const getImageFiles = useCallback(() => {
    return files.filter(f => f.type === 'image')
  }, [files])

  const getFilesWithErrors = useCallback(() => {
    return files.filter(f => f.error)
  }, [files])

  const hasValidFiles = useCallback(() => {
    return files.some(f => !f.error)
  }, [files])

  const reorderFiles = useCallback((startIndex: number, endIndex: number) => {
    setFiles(prevFiles => {
      const result = Array.from(prevFiles)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      return result
    })
  }, [])

  return {
    files,
    isProcessing,
    addFiles,
    removeFile,
    updateFileMetadata,
    updateTrackMetadata,
    clearFiles,
    getAudioFiles,
    getImageFiles,
    getFilesWithErrors,
    hasValidFiles,
    reorderFiles
  }
} 